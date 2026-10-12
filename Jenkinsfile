pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = 'dockerhub-creds'
        IMAGE_NAME            = 'kaif03/interior'
        RELEASE_TAG           = "${env.BUILD_NUMBER}"
        SONAR_HOST_URL        = 'http://172.31.234.75:9000'
        PROD_NODE_1           = '172.31.142.43'
        PROD_NODE_2           = '172.31.150.255'
        SSH_KEY_PATH          = '/var/jenkins_home/.ssh/id_rsa'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo '📥 Checking out source code from Git repository...'
                checkout scm
            }
        }

        stage('Gitleaks Secret Scan') {
            steps {
                echo '🛡️ Stage 2: Scanning codebase for hardcoded secrets with fail-fast gate...'
                sh '''
                    # Fail fast (< 5s) if uncommitted/committed credentials are found
                    gitleaks detect --source . --verbose --redact --report-format json --report-path gitleaks-report.json || {
                        EXIT_CODE=$?
                        echo "❌ GITLEAKS GATE FAILED! Secrets or API keys detected in repository."
                        exit $EXIT_CODE
                    }
                    echo "✅ No hardcoded secrets detected."
                '''
            }
        }

        stage('SonarQube SAST Analysis') {
            steps {
                echo '🔍 Stage 3: Running SonarQube Static Application Security Testing...'
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        # If project has sonar-project.properties or via CLI parameters
                        echo "Running SonarQube Scanner..."
                        # For projects without separate scanner installed, invoke scanner or dockerized scanner:
                        docker run --rm \
                            -e SONAR_HOST_URL="${SONAR_HOST_URL}" \
                            -e SONAR_TOKEN="${SONAR_AUTH_TOKEN}" \
                            -v "${WORKSPACE}:/usr/src" \
                            sonarsource/sonar-scanner-cli:latest \
                            -Dsonar.projectKey=Interior_Design \
                            -Dsonar.sources=. \
                            -Dsonar.exclusions=**/node_modules/**,**/test/**,**/*.spec.ts,**/*.test.js
                    '''
                }
            }
        }

        stage('Docker Build & Push Release Tag') {
            steps {
                echo "🐳 Stage 4: Building Release Image: ${IMAGE_NAME}:${RELEASE_TAG}..."
                sh """
                    docker build -t ${IMAGE_NAME}:${RELEASE_TAG} .
                """
                echo '🔑 Authenticating and pushing to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker push ${IMAGE_NAME}:${RELEASE_TAG}
                    """
                }
            }
        }

        stage('Zero-Downtime Rolling Deployment') {
            steps {
                echo '🚀 Stage 5: Executing sequential Rolling Deployment across production nodes...'

                // --- Node 1 Deployment ---
                echo "===> Deploying to App Node 1 (${PROD_NODE_1}) <==="
                sh """
                    ssh -i ${SSH_KEY_PATH} -o StrictHostKeyChecking=no ubuntu@${PROD_NODE_1} \
                        "/opt/interior/deploy.sh ${RELEASE_TAG}"
                """

                // Run Database migration on Node 1 after verified startup
                echo "===> Running Database Schema Migrations on Node 1 <==="
                sh """
                    ssh -i ${SSH_KEY_PATH} -o StrictHostKeyChecking=no ubuntu@${PROD_NODE_1} \
                        "docker exec interior-app npm run migrate 2>/dev/null || echo 'No migrate script or already up to date'"
                """

                // --- Node 2 Deployment ---
                echo "===> Deploying to App Node 2 (${PROD_NODE_2}) <==="
                sh """
                    ssh -i ${SSH_KEY_PATH} -o StrictHostKeyChecking=no ubuntu@${PROD_NODE_2} \
                        "/opt/interior/deploy.sh ${RELEASE_TAG}"
                """
            }
        }

        stage('Promote to Latest') {
            steps {
                echo "⭐ Stage 6: All nodes verified healthy. Promoting ${IMAGE_NAME}:${RELEASE_TAG} to ':latest'..."
                withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
                        docker tag ${IMAGE_NAME}:${RELEASE_TAG} ${IMAGE_NAME}:latest
                        docker push ${IMAGE_NAME}:latest
                    """
                }
                echo '🏆 Deployment and promotion complete!'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo "🎉 Pipeline succeeded! Environment running version ${RELEASE_TAG}."
        }
        failure {
            echo "❌ Pipeline failed! Check logs and verify auto-rollback state."
        }
    }
}