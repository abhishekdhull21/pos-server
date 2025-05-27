pipeline {
  agent any

  environment {
    AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    AWS_REGION            = "${AWS_REGION}"
    AWS_ACCOUNT_ID        = "${AWS_ACCOUNT_ID}"
    IMAGE_TAG             = "${BUILD_NUMBER}"
    ECR_REPO              = "${ECR_REPO}"
    DB_USER               = "${DEV_RDS_USER}"
    DB_PASS               = "${DEV_PASS}"
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/abhishekdhull21/pos-server.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          docker build -t pos-server:$IMAGE_TAG .
        '''
      }
    }

    stage('Push to ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO
          docker tag pos-server:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy to Dev (port 3000)') {
      environment {
        DB_HOST = "${DEV_DB_HOST}"
        DB_NAME = "${DEV_DB_NAME}"
      }
      steps {
        sh '''
          docker stop app-dev || true
          docker rm app-dev || true
          docker run -d --name app-dev -p 3000:3000 \
            -e DB_HOST=$DB_HOST -e DB_USER=$DB_USER -e DB_PASS=$DB_PASS -e DB_NAME=$DB_NAME \
            $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Manual Approval for Prod') {
      steps {
        input message: 'Deploy to production?'
      }
    }

    stage('Deploy to Prod (port 3001)') {
      environment {
        DB_HOST = "${PROD_DB_HOST}"
        DB_PASS = "${PROD_DB_PASS}"
      }
      steps {
        sh '''
          docker stop app-prod || true
          docker rm app-prod || true
          docker run -d --name app-prod -p 3001:3000 \
            -e DB_HOST=$DB_HOST -e DB_USER=$DB_USER -e DB_PASS=$DB_PASS \
            $ECR_REPO:$IMAGE_TAG
        '''
      }
    }
  }
}
