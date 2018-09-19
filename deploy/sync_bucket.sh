#!/bin/bash
# CNAME -> c.storage.googleapis.com

bad_usage(){
	echo 'Bad parameters:'
	echo "Usage: $0 <init|update> <domain> <folder_to_upload>"
	exit 1
}

init(){
	gsutil mb -l eu gs://${DOMAIN}
	gsutil iam ch allUsers:objectViewer gs://${DOMAIN}
	gsutil web set -m index.html -e index.html gs://${DOMAIN}
}

update(){
	gsutil rsync -r -d ${FOLDER} gs://${DOMAIN}
}

if  [ $# -ne 3 ] ; then
	bad_usage
	exit 1
fi

DOMAIN=$2
FOLDER=$3
OP=$1

if [ "$OP" == "init" ]; then
	init
	update
elif [ "$OP" == "update" ]; then
	update
else
  bad_usage
  exit 1
fi