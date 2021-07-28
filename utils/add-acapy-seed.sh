
#!/bin/bash
#
# This script updates an acapy.json file by adding
# an endorserSeed field with the given value.
#
# Usage:
function usage() {
  cat <<-EOF
  usage: $0 [options]

    -c : path to the acapy.json file to update
EOF
exit 1
}
#
##########################################################################################

##########################################################################################
# Check Programs needed are installed
##########################################################################################

type awk >/dev/null 2>&1 || {
  echo >&2 "awk is required but is not installed. Aborting."
  exit 1
}

##########################################################################################
# MAIN LINE 
##########################################################################################

while getopts ':c:s:' option; do
  case ${option} in
    c) configFileOption=${OPTARG} ;;
    s) seedOption=${OPTARG} ;;
    \?) usage; 
  esac
done
# Remove processed options
shift $((OPTIND -1))

# Pull the existing config file and output an added "endorserSeed" field 
awk -F: -v seed=${seedOption} \
'
/endorserSeed/ { 
    print $1": \""seed"\"," 
    ++found
    next
  }
/}/ {
    if (found == 0) {
      print " ,\"endorserSeed\": \""seed"\""
    } 
  }
{ print $0 }
' ${configFileOption} > ${configFileOption}.tmp

mv -f ${configFileOption}.tmp ${configFileOption}
