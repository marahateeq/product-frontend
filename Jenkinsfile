@Library('pipeline-build') _

// Jenkinsfile for Product Frontend
// This pipeline builds the HTML/JS frontend, creates Docker images, and publishes to registry

pipeline {
    agent any

    environment {
        APP_NAME = 'product-frontend'
        GIT_URL = 'https://github.com/example/product-frontend.git'
        BRANCH_NAME = "${env.BRANCH_NAME ?: 'main'}"
        NOTIFICATION_EMAIL = 'dev-team@example.com'
    }

    stages {
        stage('Build') {
            steps {
                script {
                    echo "Building Product Frontend..."

                    // Load the Frontend build pipeline from shared library
                    def frontendPipeline = load "../pipeline-build/Jenkinsfile.frontend"
                    frontendPipeline.executePipeline()
                }
            }
        }
    }

    post {
        success {
            echo "✅ Product Frontend build completed successfully"
        }
        failure {
            echo "❌ Product Frontend build failed"
        }
    }
}
