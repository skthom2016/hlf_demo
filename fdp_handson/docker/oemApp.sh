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

# # #askProceed 
# ./stopall.sh
# echo "=========================="
# echo "Setting env"
# echo "=========================="
. ./setenv.sh

# echo "=========================="
# echo "Bringing down the containers using docker compose"
# echo "=========================="
# docker-compose down

# echo "=========================="
# echo "Cleaning env"
# echo "=========================="
# ./clean.sh
# #docker rmi $(docker images dev*)
# #docker rmi $(docker images dev*poass*)
# #docker rmi $(docker images dev*sal*) 
# #docker rmi $(docker images dev*inv*) 
# #docker rmi $(docker images dev*car*) 

# echo "=========================="
# echo "Generate crypto"
# echo "=========================="
# #askProceed
# cryptogen generate --config=./config/crypto-config.yaml --output=./config/crypto-config

# echo "=========================="
# echo "Generate genesis Block"
# echo "=========================="
# #askProceed
# configtxgen -outputBlock  ./config/orderer/LogisticOrdererGenesis.block -channelID ordererchannel  -profile LogisticOrdererGenesis

# echo "=========================="
# echo "generate Channel transaction"
# echo "=========================="
# #askProceed
# configtxgen -outputCreateChannelTx  ./config/oem/logisticschannel.tx -channelID logisticschannel  -profile LogisticsChannel

# echo "=========================="
# echo "Bringing up the containers using docker compose"
# echo "=========================="
# #askProceed
# docker-compose up -d

# echo "=============================================================================================="
# echo "The Blockchain client of Original Equipment Manufacturer (OEM) will be hoster on this terminal"
# echo "For example in our case we will assume it as Maruthi."
# echo "OEM will be having network admin rights and it will create a channel called logisticchannel"
# echo "After channel creation, OEM will join the channel called logisticchannel"
# echo "=============================================================================================="
# askProceed
. ./setOemEnv.sh
# peer channel create -c logisticschannel -f ./config/oem/logisticschannel.tx --outputBlock ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS
# peer channel join -b ./config/oem/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

# echo "======================================================="
# echo "Query the list of channels which OEM has already joined"
# echo "======================================================="
# askProceed
# peer channel list

# echo "============================="
# echo "Install Chaincode on OEM peer"
# echo "============================="
# askProceed
# echo "GOPATH="$GOPATH
# peer chaincode install -n PoAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/poAsset
# peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
# peer chaincode install -n SalesOrderContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/SalesOrder
# peer chaincode install -n GrnAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/GRNAsset
# peer chaincode install -n InvoiceAssetContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/InvoiceAsset

# echo "=========================================="
# echo "Instantiate chaincodes on logisticschannel"
# echo "=========================================="
# askProceed
# peer chaincode instantiate -n PoAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["initPoAsset","Init_Rec","Initialisation po record"]}'
# peer chaincode instantiate -n carContract -v 0.0.1 -C logisticschannel -c '{"Args":["createCarAsset", "Init_Rec","Initialisation car record"]}'
# peer chaincode instantiate -n SalesOrderContract -v 0.0.1 -C logisticschannel -c '{"Args":["createSalesOrder", "Init_Rec","Initialisation salesOrder record"]}'
# peer chaincode instantiate -n GrnAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["createGrnAsset", "Init_Rec","Initialisation GRN record"]}'
# peer chaincode instantiate -n InvoiceAssetContract -v 0.0.1 -C logisticschannel -c '{"Args":["createInvoiceAsset", "Init_Rec","Initialisation invoice record"]}'
# sleep 2
# echo "=========================="
# echo "Chaincode Instantiated"
# echo "=========================="
# sleep 2
# echo "=========================="
# echo "Create wallet using Wallet.ts"
# echo "=========================="
# echo ""
# echo "=========================="
# echo "Create identity for Oem Admin"
# echo "=========================="
# askProceed
cd ./clientapp/typescript/dist/
# node wallet.js add oem Admin

# echo "=========================="
# echo "Create identity for Oem User1"
# echo "=========================="
# node wallet.js add oem User1

# echo "=========================="
# echo "List identities in wallet"
# echo "=========================="
# node wallet.js

. ../../../setUserOem.sh 
echo "=========================="
echo "Oem accepts the PO and creates Car assets as per order"
echo "=========================="
askProceed
node createCarAsset.js 1 $APP_USER_ID
sleep 3
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
askProceed
sleep 3
echo "=========================="
echo "Oem generates the Sales Order and sends to Dealer"
echo "=========================="
askProceed
node createSalesOrder.js 1 1 $APP_USER_ID
sleep 3
# echo "Po status is:"
# peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
# sleep 3

# echo "=========================="
# echo "Oem sends the sales order to 
# echo "=========================="
# #askProceed 
node submitSalesOrder.js 1 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'

echo " "
echo "=========================="
echo "Next Step:-Dealer must accept the Sales Order and Generate GRN"
echo "=========================="
askProceed 

echo "=========================="
echo "Oem accepts the GRN and creates the invoice"
echo "=========================="
askProceed 
sleep 3
node createInvoice.js 1 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
echo " "
echo "=========================="
echo "Next Step:-Dealer must accept the Invoice and do the payment"
echo "=========================="
askProceed 


# echo "=========================="
# echo "Dealer accepts the Invoice"
# echo "=========================="
# #askProceed 
# . ~/fdp_handson/docker/setUserDealer.sh 
# cd ~/fdp_handson/docker
# . ./setDealerEnv.sh
# # peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["acceptedInvoice","1","","N"]}'
# sleep 3
# echo "Po status is:"
# peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
# cd ./clientapp/typescript/dist/



# echo "=========================="
# echo "Dealer pays invoice  using app payInvoice.ts"
# echo "=========================="
# #askProceed 
# node payInvoice.js 1 $APP_USER_ID
# sleep 2
# echo "Po status is:"
# peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'



echo "=========================="
echo "Oem Marks as Payment received"
echo "=========================="
askProceed 
sleep 3
# . ../../../setOemEnv.sh
peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["paymentReceived","1","","N"]}'
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
echo " "
echo "=========================="
echo "Next Step:-Dealer must close the invoice"
echo "=========================="


# # echo "=========================="
# # echo "Dealer closes the invoice"
# # echo "=========================="
# # #askProceed 
# # . ./setDealerEnv.sh
# # peer chaincode invoke -C logisticschannel -n PoAssetContract -c '{"Args":["closePO","1","","N"]}'
# # sleep 2
# # echo "Po status is:"
# # peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'


# echo "=========================="
# echo "Register Car with owner BCOwner"
# echo "=========================="
# cd /home/santhosh/fdp_handson/docker/clientapp/typescript/src/pdf
# rm *.pdf
# ls -lt
# #askProceed 
# cd /home/santhosh/fdp_handson/docker/clientapp/typescript/dist/
# ##askProceed 
# node registerCar.js P1S1L0 BCOwner
# sleep 2
# #askProceed 
# peer chaincode query -C logisticschannel -n carContract -c '{"Args":["readCarAsset","P1S1L0"]}'
# cd ~/fdp_handson/docker
