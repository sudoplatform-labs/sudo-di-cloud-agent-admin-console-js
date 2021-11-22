#!/bin/bash
#
# This script brings up/shutsdown a test bowser server and webserver in 
# docker containers so that e2e tests can be isolated from browser versions
#
# Usage:
function usage() {
  cat <<-EOF
  usage: $0 [command] [options]

  Commands:

  up - Create local browser server and webserver docker containers

          start options :
          -i : docker image to use 
          -p : port to map to the browser server control port inside the container 

  down - Bring down running instance of the browser server an webserver 
         docker environment.

EOF
exit 1
}
#
##########################################################################################

##########################################################################################
# Check Programs needed are installed
##########################################################################################

type docker-compose >/dev/null 2>&1 || {
  echo >&2 "docker-compose is required but is not installed. Aborting."
  exit 1
}

# Contorted way to ensure we get the working directory that this file lives in
# even when it is run via a symlink.  Currently only tested on MAC OS
if [[ -L ${0} ]]; then
  REAL_PWD=$( cd "$(dirname ${0})"; cd "$(dirname $(readlink ${0}))" >/dev/null 2>&1 ; pwd -P )
else
  REAL_PWD=$( cd "$(dirname ${0})" >/dev/null 2>&1 ; pwd -P )
fi
# Make sure everything is done starting in our commands home directory
cd ${REAL_PWD}
ROOT_DIR="${REAL_PWD}/.."

# Print an indication of script reaching a processing 
# milestone in a noticable way
# $1 : Mesage string to print
function printMilestone() {
  echo -e "\n\n##########################################################################################"
  echo -e "#"
  echo -e "# " ${1}
  echo -e "#"
  echo -e "##########################################################################################\n"
}

# Evals a function and exits the script if any error occured
# $1 : String function to evaluate
function runEval() {
  cmdOutput=$(eval ${1})
  returnValue=$?
  if [ $returnValue != 0 ]; then
    echo "Command ${1} failed"
    exit -1
  fi
  return $returnValue
}


# Start docker browser server and webserver containers 
# $1: The browser server docker image to use
# $2: The host port number to map the browser server command port onto
function upBrowserEnv() {
    export BROWSER_SERVER_DOCKER_IMAGE=$(cut -d':' -f1 <<<${1})
    export BROWSER_SERVER_DOCKER_TAG=$(cut -d':' -f2 <<<${1})
    export BROWSER_SERVER_CONTROL_EXTERNAL_PORT=${2}
    export FRONTEND_NETWORK="von_von";
    export FRONTEND_EXTERNAL="true"

    upCmd="docker-compose -f ${ROOT_DIR}/e2e/docker/docker-compose-test.yml -p browser-environment up -d"
    
    printMilestone "Starting browser server and webserver docker images with command: \n \
        \t ${upCmd}"

    ${upCmd}
    local returnStatus=$?
    if [[ ${returnStatus} != 0 ]]; then
        echo "**** FAIL - Browser Server and Webserver failed to start, exiting. ****"
        exit 1
    fi
}

# Stop a running browser server and webserver docker containers
function downBrowserEnv() {
  downCmd="docker-compose -f ${ROOT_DIR}/e2e/docker/docker-compose-test.yml -p browser-environment down" 

  printMilestone "Stopping Browser Server and Webserver docker containers"
  ${downCmd}
}


##########################################################################################
# MAIN LINE 
##########################################################################################

# Support up, and down commands
subCommand=$1
shift || usage; 

case "${subCommand}" in
  up)
    # start comes with several options on how to construct the environment
    while getopts ':i:p:' option; do
      case ${option} in
        i) imageOption=${OPTARG} ;;
        p) hostPortOption=${OPTARG} ;;
        \?) usage; 
      esac
    done
    # Remove processed options
    shift $((OPTIND -1))


    upBrowserEnv ${imageOption} ${hostPortOption}
    ;;
  down)
    downBrowserEnv
    ;;
  *) usage; 
esac



