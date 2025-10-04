// Jenkinsfile for ccd-api-node
pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_NAME = 'ccd-api-node'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'echo "Checked out CCD API mock code successfully"'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                    docker.withRegistry("http://${REGISTRY}") {
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                script {
                    // Stop and remove existing container if it exists
                    sh """
                        docker rm -f ${IMAGE_NAME} || true
                    """

                    // Run new container on port 4452
                    sh """
                        docker run -d \\
                        --name ${IMAGE_NAME} \\
                        --restart unless-stopped \\
                        -p 4452:4452 \\
                        -e NODE_ENV=production \\
                        ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                    """
                }
            }
        }

        stage('Health Check') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sleep 5 // Wait for container to start
                    sh '''
                        echo "🔄 Waiting for CCD API mock to be ready..."
                        timeout=60
                        while [ $timeout -gt 0 ]; do
                            health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4452/health || echo "000")

                            if [ "$health_status" = "200" ]; then
                                echo "✅ CCD API mock is ready"
                                break
                            fi

                            echo "⏳ Health status: $health_status - waiting..."
                            sleep 2
                            timeout=$((timeout-2))
                        done

                        if [ $timeout -le 0 ]; then
                            echo "❌ Service failed to start within timeout"
                            docker logs ${IMAGE_NAME}
                            exit 1
                        fi
                    '''
                }
            }
        }

        stage('API Validation Tests') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        echo "🧪 Testing CCD API mock endpoints..."

                        # Test health endpoint
                        echo "Testing /health endpoint..."
                        curl -f http://localhost:4452/health || exit 1

                        # Test case validation endpoint
                        echo "Testing /cases/{caseId} endpoint..."
                        curl -f -H "Accept: application/vnd.uk.gov.hmcts.ccd-data-store-api.case.v2+json;charset=UTF-8" \\
                            http://localhost:4452/cases/1234567890123456 || exit 1

                        # Test event token endpoint
                        echo "Testing event token endpoint..."
                        curl -f http://localhost:4452/caseworkers/123/jurisdictions/PROBATE/case-types/GrantOfRepresentation/event-triggers/createDraft/token || exit 1

                        echo "✅ All endpoint tests passed!"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ CCD API mock pipeline completed successfully!'
            echo '📍 CCD API mock available at http://localhost:4452'
        }
        failure {
            echo '❌ CCD API mock pipeline failed!'
            sh 'docker logs ${IMAGE_NAME} || true'
        }
    }
}
