#!/bin/bash

set -e 

ng build

scp -r dist/AutomataJS mbisignani@linode:~/

ssh mbisignani@linode sudo ~/AutomataJS /opt/AutomataJS