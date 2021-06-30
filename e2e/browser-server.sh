#!/bin/bash
#
# This script starts/stops a test bowser server in a docker container
# so that e2e tests can be isolated from browser versions
#
# Usage:
function usage() {
  cat <<-EOF
  usage: $0 [command] [options]

  Commands:

  start - Create a local browser server docker container

          start options :
          -i : docker image to use 
          -p : port to map to the browser control port inside the container 

  stop - Stop running instance of browser server docker container

EOF
exit 1
}
#
##########################################################################################

##########################################################################################
# Check Programs needed are installed
##########################################################################################

type docker >/dev/null 2>&1 || {
  echo >&2 "docker is required but is not installed. Aborting."
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
DEVEL_DIR="${ROOT_DIR}/devel"

BROWSER_DOCKER_NAME_FILE="${DEVEL_DIR}/browser_runner.json"

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

# Pull the value for a specific field out of a simple JSON 
# format object and echo it.
# $1 : The field name
# $2 : The JSON file name
function getJSONFieldValue() {
  returnValue=`awk -F'"' '/'${1}'/ { print $4 }' ${2}`
  echo $returnValue
}

# $1: The name of a variable to return the IP address to
function getHostIP() {
  local hostOS="$(uname -s)"
  local hostIP

  if [ ${hostOS} = "Darwin" ]; then
    # Look at wired interface first
    hostIP=$(ipconfig getifaddr en1)
    if [[ $? != 0 ]]; then
      hostIP=$(ipconfig getifaddr en0)
    fi
  else
    hostIP=$(hostname -i | awk '{print $1}')
  fi
  
  local result=${1}
  if [[ "${result}" ]]; then
    eval ${result}="'${hostIP}'"
  fi
}


# Start a docker standalone browser container which has
# the host machines address injected into its DNS knowledge
# $1: The browser docker image to use
# $2: The host port number to map the browser command port onto
# $3: The name of a variable to return the container ID to
function startBrowserServer() {
    acapyContainer=$(docker ps | grep sudo-di-cloud-agent | awk '{print $1}')
    getHostIP DOCKER_HOST_IP
    randName=$(cat /dev/urandom | env LC_CTYPE=ALL tr -dc 'a-zA-Z0-9' | fold -w 16 | head -n 1)
    browserCmd="docker run -d -e SCREEN_WIDTH=1600 -e SCREEN_HEIGHT=1200 --name browser-server_${randName} --rm  --link=${acapyContainer} --add-host react.webserver:${DOCKER_HOST_IP} \
                  -p ${2}:4444 -p 5900:5900 -v /dev/shm:/dev/shm ${1}"
    
    printMilestone "Starting browser server docker image with command: \n \
        \t ${browserCmd}"

    containerId=$(${browserCmd})
    local returnStatus=$?
    if [[ ${returnStatus} != 0 ]]; then
        echo "**** FAIL - Browser Server failed to start, exiting. ****"
        exit 1
    fi
    local result=${3}
    if [[ "${result}" ]]; then
      eval ${result}="'${containerId}'"
    fi
}

# Stop a running browser server docker container
# $1: The docker container identifier
function stopBrowserServer() {
  local containerId="${1}" 
  stopCmd="docker stop ${containerId}" 

  printMilestone "Stopping Browser Server docker container id : \n \
        \t ${containerId}"
  ${stopCmd}
}


##########################################################################################
# MAIN LINE 
##########################################################################################

# Support start, and stop commands
subCommand=$1
shift || usage; 

case "${subCommand}" in
  start)
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

    if [ ! -d "${DEVEL_DIR}"  ]; then
      runEval "mkdir -p ${DEVEL_DIR}"
    fi

    startBrowserServer ${imageOption} ${hostPortOption} containerId
    # Save the browser server docker container name so that it can be killed on stop 
    # commands and not potentially destroy another instance we didn't
    # start.
    cat <<EOF > ${BROWSER_DOCKER_NAME_FILE}
    {
      "browserDockerContainer": "${containerId}"
    }
EOF
    ;;
  stop)
    containerId=$(getJSONFieldValue "browserDockerContainer" ${BROWSER_DOCKER_NAME_FILE})
    stopBrowserServer ${containerId}
    ;;
  *) usage; 
esac



