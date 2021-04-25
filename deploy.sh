#!/bin/bash

set -e 

ng build --prod

ssh mbisignani@linode "rm -rf ~/AutomataJS"

scp -r dist/AutomataJS mbisignani@linode:~/

ssh -X mbisignani@linode "sudo sh -c 'rm -rf /opt/AutomataJS; mv /home/mbisignani/AutomataJS /opt/AutomataJS'"