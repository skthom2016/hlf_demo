#!/bin/bash
#Usage:  ./clean.sh         Will clean the Orderer/Peer but will not remove artefacts
#Usage:  ./clean.sh all     In addition to above it will remove the network artefacts + crypto

killall peer
killall orderer
killall fabric-ca-server

# Kill all running containers and then clean up
docker  kill $(docker ps -q)        &> /dev/null
docker  rm   $(docker ps -a -q)     &> /dev/null

    echo "Removing crypto & artefacts as well"
    rm -rf ./config/crypto-config  &> /dev/null
    rm ./config/*.block  &> /dev/null
    rm ./config/oem/*.block  &> /dev/null    
    rm ./config/oem/*.tx  &> /dev/null
    rm ./config/*.tx  &> /dev/null
    rm ./config/orderer/*.block  &> /dev/null

    rm -rf ./clientapp/typescript/dist/user-wallet
# echo "Removing ledger data for Orderer | Peers"
#  docker volume rm bcgarage_data-peer1.oem.com
#  docker volume rm bcgarage_data-peer1.dealer.com
#  docker volume rm bcgarage_data-orderer.acme.com
#  docker network prune  -f

# Prune the network & volume
docker volume prune -f
docker network prune -f

echo    "Done [Ignore process not found messages]"