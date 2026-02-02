pipeline {
    agent any

    tools {
        nodejs "nodejs"
    }

    stages {
        stage('Health check') {
            steps {
                sh 'which node && node -v'
                sh 'which npm && npm -v'
            }
        }

        stage('Install dependencies') {
            steps {
                dir('webapp') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            environment {
                NODE_ENV = 'production'
            }
            steps {
                dir('webapp') {
                    sh 'npm run build'
                }
            }
        }

        stage('Deploy to Nginx') {
            steps {
                sh 'sudo /usr/local/bin/deploy_blog.sh waynemo webapp/out'
            }
        }

        stage('Archive site') {
            steps {
                archiveArtifacts artifacts: 'webapp/out/**', fingerprint: true
            }
        }
    }

    post {
        success {
            echo '✅ Build and export completed successfully'
        }
        failure {
            echo '❌ Build failed'
        }
    }
}
