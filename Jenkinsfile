pipeline {
    agent any

    environment {
        EC2_IP = "52.78.179.97"
        BUILD_DIR = "build"
        CONTAINER_NAME = "petory-nginx"
        TARGET_DIR = "/home/frontend-build"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/SJ-Petory/Petroy-FrontEnd.git'
            }
        }

        stage('Install & Build') {
            steps {
                script {
                    docker.image('node:20').inside {
                        sh '''
                        npm config set cache /var/jenkins_home/.npm-cache
                        npm ci
                        export NODE_OPTIONS=--max_old_space_size=4096
                        npm run build
                        '''
                    }
                }
            }
        }

        stage('Upload to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-credentials',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh """
                    ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${EC2_IP} 'mkdir -p ${TARGET_DIR} && rm -rf ${TARGET_DIR}/*'
                    scp -i \$SSH_KEY -o StrictHostKeyChecking=no -r ${BUILD_DIR}/* \$SSH_USER@${EC2_IP}:${TARGET_DIR}/
                    """
                }
            }
        }

        stage('Deploy to Nginx Container') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-credentials',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh """
                    ssh -i \$SSH_KEY -o StrictHostKeyChecking=no \$SSH_USER@${EC2_IP} '
                        docker exec ${CONTAINER_NAME} rm -rf /usr/share/nginx/html/* &&
                        docker cp ${TARGET_DIR}/. ${CONTAINER_NAME}:/usr/share/nginx/html/ &&
                        docker restart ${CONTAINER_NAME}
                    '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ 배포 성공"
        }
        failure {
            echo "❌ 배포 실패"
        }
    }
}