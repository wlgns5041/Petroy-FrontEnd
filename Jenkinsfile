pipeline {
    agent any

    environment {
        EC2_HOST = "ec2-user@52.78.179.97"
        SSH_KEY = "~/.ssh/id_rsa"
        BUILD_DIR = "build"
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
                        sh "mkdir -p ${WORKSPACE}/build"
                        sh "npm ci"
                        sh "export NODE_OPTIONS=--max_old_space_size=4096 && npm run build"
                        sh "cp -r build/* ${WORKSPACE}/build/"
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh """
                ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_HOST} 'sudo rm -rf /usr/share/nginx/html/*'
                ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no -r ${BUILD_DIR}/* ${EC2_HOST}:/home/frontend-build/
                ssh -i ${SSH_KEY} ${EC2_HOST} 'sudo cp -r /home/frontend-build/* /usr/share/nginx/html/'
                ssh -i ${SSH_KEY} ${EC2_HOST} 'sudo systemctl restart nginx'
                """
            }
        }
    }
}