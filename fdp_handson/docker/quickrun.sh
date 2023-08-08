clear
echo "=========================="
echo "Setting env"
echo "=========================="
. ./setenv.sh

echo "=========================="
echo "Bringing down the containers using docker compose"
echo "=========================="
docker-compose down

echo "=========================="
echo "Cleaning env"
echo "=========================="
killall peer
killall orderer
killall fabric-ca-server

# Kill all running containers and then clean up
docker  kill $(docker ps -q)        &> /dev/null
docker  rm   $(docker ps -a -q)     &> /dev/null
docker volume prune -f
docker network prune -f


#docker rmi $(docker images dev*)


echo "=========================="
echo "Bringing up the containers using docker compose"
echo "=========================="
docker-compose up -d

echo "=========================="
echo "Setting env for Oem"
echo "=========================="
. ./setOemEnv.sh

echo "=========================="
echo "Submit channel transaction"
echo "=========================="
peer channel create -c logisticschannel -f ./config/oem/logisticschannel.tx --outputBlock ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

echo "=========================="
echo "Submit channel join for Oem"
echo "=========================="
peer channel join -b ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

echo "=========================="
echo "Query channel list for Oem"
echo "=========================="
peer channel list

echo "=========================="
echo "Setting env for Dealer"
echo "=========================="
. ./setDealerEnv.sh

echo "=========================="
echo "Fetch channel Genesis block for Dealer"
echo "=========================="
peer channel fetch 0 LogisticOrdererGenesis.block -c logisticschannel -o $ORDERER_ADDRESS

echo "=========================="
echo "Submit channel join for Dealer"
echo "=========================="
peer channel join -b ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

echo "=========================="
echo "Query channel list for Dealer"
echo "=========================="
peer channel list

echo "=========================="
echo "Setting env for Oem"
echo "=========================="
. ./setOemEnv.sh

echo "=========================="
echo "Chaincode install on peers of both Oem and Dealer"
echo "=========================="
echo "GOPATH="$GOPATH
peer chaincode install -n PoAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/poAsset
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
peer chaincode install -n SalesOrderContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/SalesOrder
. ./setDealerEnv.sh
peer chaincode install -n PoAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/poAsset
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
peer chaincode install -n SalesOrderContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/SalesOrder

echo "=========================="
echo "Chaincode intantiate on logisticschannel through Oem"
echo "=========================="
. ./setOemEnv.sh
peer chaincode instantiate -n PoAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["createPoAsset","Init_Rec","Initialisation po record"]}'
peer chaincode instantiate -n carContract -v 0.0.1 -C logisticschannel -c '{"Args":["createCarAsset", "Init_Rec","Initialisation car record"]}'
peer chaincode instantiate -n SalesOrderContract -v 0.0.1 -C logisticschannel -c '{"Args":["createSalesOrder", "Init_Rec","Initialisation salesOrder record"]}'
sleep 5


echo "=========================="
echo "List identities in wallet"
echo "=========================="
cd ./clientapp/typescript/src/
node wallet.js

echo "=========================="
echo "Submit PO using peer1.dealer.com"
echo "=========================="
. ~/fdp_handson/docker/setUserDealer.sh 
node submitPo.js 1 $APP_USER_ID 
sleep 5
echo "=========================="
echo "Query PO using peer1.dealer.com"
echo "=========================="
#peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoAsset","1"]}'
#peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["poAssetchangeState","1","Po Created"]}'
echo "=========================="
echo "Query PO using client"
echo "=========================="
. ~/fdp_handson/docker/setUserOem.sh 
node createCarAsset.js 1 $APP_USER_ID
node createSalesOrder.js 1 1 $APP_USER_ID
node submitSalesOrder.js 1 $APP_USER_ID
sleep 5
echo "=========================="
echo "Query SO using peer1.dealer.com"
echo "=========================="
#peer chaincode query -C logisticschannel -n SalesOrderContract -c '{"Args":["readSalesOrder","1"]}'
#peer chaincode query -C logisticschannel -n SalesOrderContract -c '{"Args":["readctxProp"]}'
#peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["getCurrentUserId"]}'
# node createCarAsset.js 2
# node createCarAsset.js 3
cd ~/fdp_handson/docker
