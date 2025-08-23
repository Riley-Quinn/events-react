pipeline {
    agent { label 'MTX_Agent' }
tools{
        nodejs 'Nodejs'
    }
    environment {
        USER = credentials('ER_User')
        HOST = credentials('ER_Host')
        KEY_PATH = credentials('ER_Key_Path')
        REMOTE_APP_DIR = credentials('ER_Remote_App_Dir')
        LOCAL_BUILD_DIR = credentials('ER_Local_Build_Dir')
        DEV_LOCAL_WORK_DIR = credentials('ER_Local_Work_Dir')
        ENV_BUILD_DIR = credentials('ER_Env_Var_Path')
        CI = 'false'
        SONAR_AUTH_TOKEN = credentials('ER_Sonar_Auth_Token')
        SONAR_HOST_URL = credentials('ER_Sonar_Host_URL')
        PROJECT_KEY = credentials('ER_Project_Key')
        PROJECT_NAME = credentials('ER_Project_Name')
        EMAIL_RECEIVERS = credentials('ER_email_receivers')
        targetBranch = ''
       }
    stages {
        stage('checking branch name') {
            steps {
                script {
                    targetBranch = env.GIT_BRANCH.replace('origin/', '')
                    echo "Target Branch: ${targetBranch}"
                }
            }
        }
        stage('Adding .env variables for DEV'){
            when {
                expression { targetBranch == 'dev' } // Only execute if the branch is 'dev'
            }
            steps {
                withCredentials([file(credentialsId: 'ER_env_var', variable: 'env_var')]) {
                    sh """
                        scp ${env_var} ${ENV_BUILD_DIR}
                        cat ${ENV_BUILD_DIR}
                    """
                }
            }
        }
        stage('Build'){
            steps{
                script{
                    echo "building the build folder"
                    sh """
                        npm install -f 
                        npm run build
                    """
                }
            }
        }
        stage('SonarQube Analysis on DEV') {
            when {
                expression { targetBranch == 'dev' } // Only execute if the branch is 'dev'
            }
            environment{
                SonarScannerHome = tool 'Hilton'
            }
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${SonarScannerHome}/bin/sonar-scanner/bin/sonar-scanner -X \
                                -Dsonar.projectKey=${PROJECT_KEY} \
                                -Dsonar.projectName=${PROJECT_NAME} \
                                -Dsonar.sources=. \
                                -Dsonar.java.binaries=target/test-classes/com/visualpathit/account/controllerTest/ \
                                -Dsonar.junit.reportsPath=target/surefire-reports/ \
                                -Dsonar.jacoco.reportsPath=target/jacoco.exec \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.token=${SONAR_AUTH_TOKEN} \
                                -X
                        """
                    }
                }
            }
        }
        stage('Quality Gate'){
            steps{
                timeout(time: 20, unit: 'MINUTES'){
                waitForQualityGate abortPipeline: true
                }
            }
        }
        stage('Deploy to EC2 on DEV') {
            when {
                expression { targetBranch == 'dev' } // Only execute if the branch is 'dev'
            }
            steps {
                script {
                    echo "Deploying build to EC2 instance"
                    sh """
                    rsync -avz -e 'ssh -i ${KEY_PATH} -o StrictHostKeyChecking=no' --delete ${LOCAL_BUILD_DIR} ${USER}@${HOST}:${REMOTE_APP_DIR}
                    """
                }
            }
        }
        stage('Removing the node modules on DEV') {
            when {
                expression { targetBranch == 'dev' } 
            }
            steps {
                sh """
                    cd ${DEV_LOCAL_WORK_DIR} && echo "changed to local work directory"
                    rm -rf node_modules/
                    rm -rf dist/
                """
            }
        }
    }

    post {
        always{
            emailext attachLog: true, body: """Pipeline Details:-
Pipeline Name: ${env.JOB_NAME}
Execution Status: ${currentBuild.currentResult}
Build Number: ${env.BUILD_NUMBER}""", subject: """${env.JOB_NAME} - ${env.BUILD_NUMBER} - ${currentBuild.currentResult}""", to: """${EMAIL_RECEIVERS}"""
        }
    }
    }