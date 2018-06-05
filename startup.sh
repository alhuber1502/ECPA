#!/bin/bash
cd ~/Dropbox/projects/ecep/data/methodologies/morphadorner2/maserver/
rm -f morphadornerserver.log
./runmaserver &
sleep 5
cd ~/Dropbox/projects/ecep/data/methodologies/stanford-ner-2014-10-26/
./runner4server &
sleep 5
cd ~/Dropbox/projects/ecep/data/methodologies/SEMAFOR/semafor-3.0-alpha-04/
./runSEMAFORserver &
cd ~/Dropbox/projects/ecep/
