pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_REPO = 'sonii26/petory-frontend'
        CONTAINER_NAME = 'petory-frontend'
        NODE_OPTIONS = "--max_old_space_size=4096"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: 'github-credentials',
                    url: 'https://github.com/SJ-Petory/Petroy-FrontEnd.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}:latest", ".")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKERHUB_CREDENTIALS) {
                        sh """
                            docker push ${DOCKERHUB_REPO}:latest
                        """
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    def running = sh(script: "docker ps --filter name=$CONTAINER_NAME --format '{{.Names}}'", returnStdout: true).trim()
                    if (running == "") {
                        sh """
                            docker pull ${DOCKERHUB_REPO}:latest
                            docker run -d --name $CONTAINER_NAME -p 80:80 ${DOCKERHUB_REPO}:latest
                        """
                    } else {
                        echo "Container $CONTAINER_NAME already running. Skipping deployment."
                    }
                }
            }
        }

        stage('Clean up old images') {
            steps {
                script {
                    sh '''
                        echo "Cleaning up old docker images..."
                        docker image prune -f
                        docker images | grep sonii26/petory-frontend | grep -v latest | awk '{print $3}' | xargs -r docker rmi -f
                    '''
                }
            }
        }
    }
}