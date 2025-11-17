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
                sh "npm ci"
                sh "npm run build"
            }
        }

        stage('Deploy to EC2') {
            steps {
                sh """
                ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_HOST} 'sudo rm -rf /usr/share/nginx/html/*'
                scp -i ${SSH_KEY} -r ${BUILD_DIR}/* ${EC2_HOST}:/home/frontend-build/
                ssh -i ${SSH_KEY} ${EC2_HOST} 'sudo cp -r /home/frontend-build/* /usr/share/nginx/html/'
                ssh -i ${SSH_KEY} ${EC2_HOST} 'sudo systemctl restart nginx'
                """
            }
        }
    }
}

// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
//         DOCKERHUB_REPO = 'sonii26/petory-frontend'
//         CONTAINER_NAME = 'petory-frontend'
//         NODE_OPTIONS = "--max_old_space_size=4096"
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 git branch: 'develop',
//                     credentialsId: 'github-credentials',
//                     url: 'https://github.com/SJ-Petory/Petroy-FrontEnd.git'
//             }
//         }

//         stage('Build Docker Image') {
//             steps {
//                 script {
//                     docker.build("${DOCKERHUB_REPO}:latest", ".")
//                 }
//             }
//         }

//         stage('Push Docker Image') {
//             steps {
//                 script {
//                     docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
//                         sh "docker push ${DOCKERHUB_REPO}:latest"
//                     }
//                 }
//             }
//         }

//         stage('Deploy') {
//             steps {
//                 script {
//                     sh """
//                         if [ \$(docker ps -q -f name=${CONTAINER_NAME}) ]; then
//                             echo "Stopping and removing existing container..."
//                             docker stop ${CONTAINER_NAME} || true
//                             docker rm ${CONTAINER_NAME} || true
//                         fi

//                         echo "Deploying new container..."
//                         docker run -d --name ${CONTAINER_NAME} -p 80:80 ${DOCKERHUB_REPO}:latest
//                     """
//                 }
//             }
//         }

//         stage('Clean up old images') {
//             steps {
//                 script {
//                     sh '''
//                         echo "Cleaning up old docker images..."
//                         docker image prune -f
//                         docker images | grep sonii26/petory-frontend | grep -v latest | awk '{print $3}' | xargs -r docker rmi -f
//                     '''
//                 }
//             }
//         }
//     }
// }
