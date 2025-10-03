pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'   
        DOCKERHUB_REPO = 'sonii26/petory-frontend'       
        CONTAINER_NAME = 'petory-frontend'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}:${env.BUILD_NUMBER}", ".")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        sh "docker push ${DOCKERHUB_REPO}:${env.BUILD_NUMBER}"
                        sh "docker tag ${DOCKERHUB_REPO}:${env.BUILD_NUMBER} ${DOCKERHUB_REPO}:latest"
                        sh "docker push ${DOCKERHUB_REPO}:latest"
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh """
                        docker stop $CONTAINER_NAME || true
                        docker rm $CONTAINER_NAME || true
                        docker pull ${DOCKERHUB_REPO}:latest
                        docker run -d --name $CONTAINER_NAME -p 80:80 ${DOCKERHUB_REPO}:latest
                    """
                }
            }
        }
    }
}