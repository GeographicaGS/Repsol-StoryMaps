pipeline {

  agent {
    node {
      label 'docker'
    }
  }

  stages {
    stage('Building') {
      steps {
        sh "docker build --pull=true -t geographica/repsol_storymaps ."
      }
    }

    stage('Linter') {
      steps {
        sh "docker run -i --rm geographica/repsol_storymaps npm run-script lint"
      }
    }

    stage("Deploy") {
      when {
          anyOf {
              branch 'master';
              //branch 'staging';
              // branch 'dev';
          }
      }
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            DEPLOY_TO = "prod"
          } 
        }
        sh "docker run -i --rm  -v \$(pwd)/dist:/usr/src/app/dist geographica/repsol_storymaps ng build --environment=${DEPLOY_TO} -op dist/dist"
        sh "./deploy/sync_bucket.sh update repsol-storymaps.geographica.gs ./dist/dist"
      }
      post {
       failure {
         echo "Pipeline is done"
         // notify users when the Pipeline fails
         mail to: 'build@geographica.gs',
         subject: "Failed Repsol StoryMaps ${env.BRANCH_NAME}: ${currentBuild.fullDisplayName}",
         body: "Something is wrong with ${env.BUILD_URL}"
       }
     }
    }
  }
}