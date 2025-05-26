pipeline {
  agent any

  environment {
    AWS_ACCESS_KEY_ID     = credentials('aws-access-key-id')
    AWS_SECRET_ACCESS_KEY = credentials('aws-secret-access-key')
    ECR_REPO               = 'your-aws-account-id.dkr.ecr.region.amazonaws.com/your-app-name'
    IMAGE_TAG              = "${env.BUILD_NUMBER}"
    DB_HOST                = 'aurora-crm-dev.cluster-xxxxxxxx.region.rds.amazonaws.com'
    DB_USER                = credentials('aurora-db-user')
    DB_PASS                = credentials('aurora-db-password')
  }

  stages {
    stage('Checkout') {
      steps {
        git 'https://github.com/your-org/your-node-backend-repo.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t $ECR_REPO:$IMAGE_TAG .'
      }
    }

    stage('Push to ECR') {
      steps {
        sh '''
          aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin $ECR_REPO
          docker push $ECR_REPO:$IMAGE_TAG
        '''
      }
    }

    stage('Deploy to Dev') {
      steps {
        sshagent(['ec2-dev-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@<dev-ec2-ip> "
              docker pull $ECR_REPO:$IMAGE_TAG &&
              docker stop app || true &&
              docker rm app || true &&
              docker run -d --name app -p 3000:3000 \
                -e DB_HOST=$DB_HOST -e DB_USER=$DB_USER -e DB_PASS=$DB_PASS \
                $ECR_REPO:$IMAGE_TAG
            "
          '''
        }
      }
    }

    stage('Manual Approval to Deploy to Prod') {
      steps {
        input message: 'Deploy to production?'
      }
    }

    stage('Deploy to Prod') {
      environment {
        DB_HOST = 'aurora-crm-prod.cluster-xxxxxxxx.region.rds.amazonaws.com'
      }
      steps {
        sshagent(['ec2-prod-key']) {
          sh '''
            ssh -o StrictHostKeyChecking=no ubuntu@<prod-ec2-ip> "
              docker pull $ECR_REPO:$IMAGE_TAG &&
              docker stop app || true &&
              docker rm app || true &&
              docker run -d --name app -p 3000:3000 \
                -e DB_HOST=$DB_HOST -e DB_USER=$DB_USER -e DB_PASS=$DB_PASS \
                $ECR_REPO:$IMAGE_TAG
            "
          '''
        }
      }
    }
  }
}
