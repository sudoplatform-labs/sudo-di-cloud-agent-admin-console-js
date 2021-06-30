#!/bin/bash
#
# This script iterates through all .ts and .tsx files recursively starting from the 
# given directory and adds eslint:disable to the start of each.
#
# Usage:
function usage() {
  echo -e "usage: ./$0 path-to-files\n"
}
#
##########################################################################################

##########################################################################################
# Check Programs needed are installed
##########################################################################################

type find >/dev/null 2>&1 || {
  echo >&2 "find is required but is not installed. Aborting."
  exit 1
}

type sed >/dev/null 2>&1 || {
  echo >&2 "sed is required but is not installed. Aborting."
  exit 1
}

hostOS="$(uname -s)"
if [ ${hostOS} = "Darwin" ]; then
  find ${1} -name "*.ts" -exec sed -i '' \
  '1i\
\/\* eslint-disable \*\/
  ' {} \;
  find ${1} -name "*.tsx" -exec sed -i '' \
  '1i\
\/\* eslint-disable \*\/
  ' {} \;
else
  find ${1} -name "*.ts" -exec sed -i '1i \/\* eslint-disable \*\/' {} \;
  find ${1} -name "*.tsx" -exec sed -i '1i \/\* eslint-disable \*\/' {} \;
fi


