#!/bin/bash
#
# This script updates an acapy.json file with the
# network address of the running acapy container.
#
# Usage:
function usage() {
  cat <<-EOF
  usage: $0 [options]

    -c : path to the acapy.json file to update 
    -h : the hostname/ip to set in the acapyAdminUri field
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

type awk >/dev/null 2>&1 || {
  echo >&2 "awk is required but is not installed. Aborting."
  exit 1
}

##########################################################################################
# MAIN LINE 
##########################################################################################

while getopts ':c:h:' option; do
  case ${option} in
    c) configFileOption=${OPTARG} ;;
    h) hostOption=${OPTARG} ;;
    \?) usage; 
  esac
done
# Remove processed options
shift $((OPTIND -1))

# Pull the existing config file and output an updated "acapyAdminUri" field 
awk -F: -v host=${hostOption} \
'{ \
  if ($1 ~ "acapyAdminUri" ) { \
    print $1":",$2"://"host":"$4 
  } \
  else { \
    print $0
  } \
}' ${configFileOption} > ${configFileOption}.tmp

mv -f ${configFileOption}.tmp ${configFileOption}
