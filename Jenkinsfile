pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-credentials'
        DOCKERHUB_REPO = 'sonii26/petory-frontend'
        BUILD_CONTAINER = 'petory-build-temp'
        TARGET_DIR = '/home/ec2-user/petory/frontend-build'
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

        stage('Extract Build Output to EC2') {
            steps {
                script {
                    sh """
                        echo "==== 임시 컨테이너 생성 ===="
                        docker create --name ${BUILD_CONTAINER} ${DOCKERHUB_REPO}:latest

                        echo "==== 기존 빌드 삭제 ===="
                        sudo rm -rf ${TARGET_DIR}
                        sudo mkdir -p ${TARGET_DIR}

                        echo "==== 빌드 파일 복사 ===="
                        docker cp ${BUILD_CONTAINER}:/usr/share/nginx/html ${TARGET_DIR}

                        echo "==== 임시 컨테이너 제거 ===="
                        docker rm ${BUILD_CONTAINER}
                    """
                }
            }
        }

        stage('Reload Nginx') {
            steps {
                sh "sudo systemctl restart nginx"
            }
        }

        stage('Clean up old images') {
            steps {
                script {
                    sh '''
                        docker image prune -f
                    '''
                }
            }
        }
    }
}