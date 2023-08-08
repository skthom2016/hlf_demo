clear
# Ask user for confirmation to proceed
function askProceed() {
  read -p "Continue? [Y/n] " ans
  case "$ans" in
  y | Y | "")
    echo "proceeding ..."
    ;;
  n | N)
    echo "exiting..."
    exit 1
    ;;
  *)
    echo "invalid response"
    #askProceed
    ;;
  esac
}

# #askProceed 
./stopall.sh
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
./clean.sh
#docker rmi $(docker images dev*)
#docker rmi $(docker images dev*poass*)
#docker rmi $(docker images dev*sal*) 
#docker rmi $(docker images dev*inv*) 
#docker rmi $(docker images dev*car*) 

echo "=========================="
echo "Generate crypto"
echo "=========================="
#askProceed
cryptogen generate --config=./config/crypto-config.yaml --output=./config/crypto-config

echo "=========================="
echo "Generate genesis Block"
echo "=========================="
#askProceed
configtxgen -outputBlock  ./config/orderer/LogisticOrdererGenesis.block -channelID ordererchannel  -profile LogisticOrdererGenesis

echo "=========================="
echo "generate Channel transaction"
echo "=========================="
#askProceed
configtxgen -outputCreateChannelTx  ./config/oem/logisticschannel.tx -channelID logisticschannel  -profile LogisticsChannel

echo "=========================="
echo "Bringing up the containers using docker compose"
echo "=========================="
#askProceed
docker-compose up -d

echo "=========================="
echo "Setting env for Oem"
echo "=========================="
. ./setOemEnv.sh

echo "=========================="
echo "Submit channel transaction"
echo "=========================="
#askProceed
peer channel create -c logisticschannel -f ./config/oem/logisticschannel.tx --outputBlock ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

echo "=========================="
echo "Submit channel join for Oem"
echo "=========================="
#askProceed
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
#askProceed
peer channel fetch 0 LogisticOrdererGenesis.block -c logisticschannel -o $ORDERER_ADDRESS

echo "=========================="
echo "Submit channel join for Dealer"
echo "=========================="
peer channel join -b ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

echo "=========================="
echo "Query channel list for Dealer"
echo "=========================="
peer channel list
#askProceed

echo "=========================="
echo "Setting env for Oem"
echo "=========================="
. ./setOemEnv.sh

echo "=========================="
echo "Chaincode install on peers of both Oem and Dealer"
echo "=========================="
#askProceed
echo "GOPATH="$GOPATH
peer chaincode install -n PoAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/poAsset
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
peer chaincode install -n SalesOrderContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/SalesOrder
peer chaincode install -n GrnAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/GRNAsset
peer chaincode install -n InvoiceAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/InvoiceAsset

. ./setDealerEnv.sh
peer chaincode install -n PoAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/poAsset
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
peer chaincode install -n SalesOrderContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/SalesOrder
peer chaincode install -n GrnAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/GRNAsset
peer chaincode install -n InvoiceAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/InvoiceAsset

echo "=========================="
echo "Chaincode intantiate on logisticschannel through Oem"
echo "=========================="
#askProceed
. ./setOemEnv.sh

peer chaincode instantiate -n PoAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["initPoAsset","Init_Rec","Initialisation po record"]}'
peer chaincode instantiate -n carContract -v 0.0.1 -C logisticschannel -c '{"Args":["createCarAsset", "Init_Rec","Initialisation car record"]}'
peer chaincode instantiate -n SalesOrderContract -v 0.0.1 -C logisticschannel -c '{"Args":["createSalesOrder", "Init_Rec","Initialisation salesOrder record"]}'
peer chaincode instantiate -n GrnAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["createGrnAsset", "Init_Rec","Initialisation GRN record"]}'
peer chaincode instantiate -n InvoiceAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["createInvoiceAsset", "Init_Rec","Initialisation invoice record"]}'

sleep 2

echo "=========================="
echo "Chaincode Instantiated"
echo "=========================="

echo "=========================="
echo "Create wallet using Wallet.ts"
echo "=========================="
#askProceed
echo "=========================="
echo "Create identity for Oem Admin"
echo "=========================="
cd ./clientapp/typescript/dist/
node wallet.js add oem Admin

echo "=========================="
echo "Create identity for Oem User1"
echo "=========================="
node wallet.js add oem User1

echo "=========================="
echo "Create identity for Dealer Admin"
echo "=========================="
node wallet.js add dealer Admin

echo "=========================="
echo "Create identity for Dealer User1"
echo "=========================="
node wallet.js add dealer User1

echo "=========================="
echo "List identities in wallet"
echo "=========================="
node wallet.js

echo "=========================="
echo "Setting the user to Admin@dealer.com"
echo "=========================="
. ../../../setUserDealer.sh


echo "=========================="
echo "Creating PO using the app submitPo.ts"
echo "=========================="
#askProceed 
node submitPo.js 1 $APP_USER_ID 
#node submitPo.js 2
#node submitPo.js 3
sleep 3
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'

echo "=========================="
echo "Setting the user to Admin@oem.com"
echo "=========================="
. ~/fdp_handson/docker/setUserOem.sh 



echo "=========================="
echo "Oem accepts the po and create Car assets using createCarAsset.ts"
echo "=========================="
#askProceed
node createCarAsset.js 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Oem generates the So using  app createSalesOrder.ts"
echo "=========================="
#askProceed
node createSalesOrder.js 1 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Oem submits the So using  app submitSalesOrder.ts"
echo "=========================="
#askProceed 
node submitSalesOrder.js 1 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'




echo "=========================="
echo "Accepted the S0 as Dealer"
echo "=========================="
cd ~/fdp_handson/docker
. ./setDealerEnv.sh
# peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["soAccepted","1","","N"]}'
# sleep 2 
# echo "Po status is:"
# peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'


echo "=========================="
echo "Dealer creates GRN  using app createGRN.ts"
echo "=========================="
#askProceed 
cd ./clientapp/typescript/dist/
node createGRN.js 1 1 Y $APP_USER_ID
sleep 2 
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
cd ~/fdp_handson/docker
. ./setOemEnv.sh
. ./setUserOem.sh 
cd ./clientapp/typescript/dist/



# echo "=========================="
# echo "Accepted the GRN"
# echo "=========================="
# #askProceed 
# peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["acceptedGRN","1","","N"]}'
# sleep 2
# echo "Po status is:"
# peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Oem creates invoice  using app createInvoice.ts"
echo "=========================="
#askProceed 
node createInvoice.js 1 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Dealer accepts the Invoice"
echo "=========================="
#askProceed 
. ~/fdp_handson/docker/setUserDealer.sh 
cd ~/fdp_handson/docker
. ./setDealerEnv.sh
# peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["acceptedInvoice","1","","N"]}'
sleep 3
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
cd ./clientapp/typescript/dist/



echo "=========================="
echo "Dealer pays invoice  using app payInvoice.ts"
echo "=========================="
#askProceed 
node payInvoice.js 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Oem Marks as Payment received, Pause and run test1.sh "
echo "=========================="
#askProceed 
cd ~/fdp_handson/docker
. ./setOemEnv.sh
peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["paymentReceived","1","","N"]}'
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'


echo "=========================="
echo "Dealer closes the invoice"
echo "=========================="
#askProceed 
. ./setDealerEnv.sh
peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["closePO","1","","N"]}'
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'


echo "=========================="
echo "Register Car with owner BCOwner"
echo "=========================="
cd /home/santhosh/fdp_handson/docker/clientapp/typescript/src/pdf
rm *.pdf
ls -lt
#askProceed 
cd /home/santhosh/fdp_handson/docker/clientapp/typescript/dist/
##askProceed 
node registerCar.js P1S1L0 BCOwner
sleep 2
#askProceed 
peer chaincode query -C logisticschannel -n carContract -c '{"Args":["readCarAsset","P1S1L0"]}'
cd ~/fdp_handson/docker
