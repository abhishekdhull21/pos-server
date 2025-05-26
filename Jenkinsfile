pipeline {
  agent any

  environment {
    AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    AWS_REGION            = "${AWS_REGION}"
    AWS_ACCOUNT_ID        = "${AWS_ACCOUNT_ID}"
    IMAGE_TAG             = "${BUILD_NUMBER}"
    ECR_REPO              = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/pos-server"
    DB_USER               = credentials('aurora-db-user')
    DB_PASS               = credentials('aurora-db-password')
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
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
          docker tag pos-server:$IMAGE_TAG $ECR_REPO:$IMAGE_TAG
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy to Dev (port 3000)') {
      environment {
        DB_HOST = 'aurora-crm-dev.cluster-xxxx.ap-south-1.rds.amazonaws.com'
      }
      steps {
        sh '''
          docker stop app-dev || true
          docker rm app-dev || true
          docker run -d --name app-dev -p 3000:3000 \
            -e DB_HOST=$DB_HOST -e DB_USER=$DB_USER -e DB_PASS=$DB_PASS \
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
        DB_HOST = 'aurora-crm-prod.cluster-xxxx.ap-south-1.rds.amazonaws.com'
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
