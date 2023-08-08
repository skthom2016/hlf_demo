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

echo "=========================="
echo "Generate crypto"
echo "=========================="
cryptogen generate --config=./config/crypto-config.yaml --output=./config/crypto-config

echo "=========================="
echo "Generate genesis Block"
echo "=========================="
configtxgen -outputBlock  ./config/orderer/LogisticOrdererGenesis.block -channelID ordererchannel  -profile LogisticOrdererGenesis

echo "=========================="
echo "generate Channel transaction"
echo "=========================="
configtxgen -outputCreateChannelTx  ./config/oem/logisticschannel.tx -channelID logisticschannel  -profile LogisticsChannel

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
peer chaincode install -n PoContract -v 0.0.3 -l node -p ../../fdp_handson/chaincode/po
#peer chaincode install -n PoContract -v 0.0.2 -l node -p ../../po
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car
. ./setDealerEnv.sh
peer chaincode install -n PoContract -v 0.0.3 -l node -p ../../fdp_handson/chaincode/po
#peer chaincode install -n PoContract -v 0.0.2 -l node -p ../../po
peer chaincode install -n carContract -v 0.0.1 -l node -p ../../fdp_handson/chaincode/car

echo "=========================="
echo "Chaincode intantiate on logisticschannel through Oem"
echo "=========================="
. ./setOemEnv.sh
peer chaincode instantiate -n PoContract -v 0.0.3 -C logisticschannel -c '{"Args":["createPo", "1", [ { order_sno: 1,make: "Maruthi",    model_name: "Swift",   colour: "Blue",    qty: 5,    received: "N"}],"N"]}'
peer chaincode instantiate -n carContract -v 0.0.1 -C logisticschannel -c '{"Args":["createCarAsset", "1", "One"]}'
sleep 5

echo "=========================="
echo "Chaincode query on Oem"
echo "=========================="
peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","1"]}'
peer chaincode query -C logisticschannel -n carContract -c '{"Args":["readCarAsset","1"]}'
echo "=========================="
echo "Chaincode invoke on Oem"
echo "=========================="
peer chaincode invoke -C logisticschannel -n PoContract -c '{"Args":["updatePo","1","One"]}'
sleep 2

echo "=========================="
echo "Chaincode query on Dealer"
echo "=========================="
. ./setDealerEnv.sh
peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","1"]}'

echo "=========================="
echo "Create wallet"
echo "=========================="

echo "=========================="
echo "Create identity for Oem Admin"
echo "=========================="
cd ./clientapp/typescript/src/
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
echo "Submit PO using peer1.dealer.com"
echo "=========================="
node submitPo.js 2
#node submitPo.js 3
#node submitPo.js 4
sleep 5
echo "=========================="
echo "Query PO using peer1.dealer.com"
echo "=========================="
peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","1"]}'
peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","2"]}'
#peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","3"]}'
#peer chaincode query -C logisticschannel -n PoContract -c '{"Args":["readPo","4"]}'
echo "=========================="
echo "Query PO using client"
echo "=========================="
#node createCarAsset.js 1
node createCarAsset.js 2
#node createCarAsset.js 3
#node createCarAsset.js 4
cd ~/fdp_handson/docker
