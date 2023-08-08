export FABRIC_CFG_PATH=$PWD/config
export COMPOSE_PROJECT_NAME=bcgarage
export IMAGE_TAG=latest
./clean.sh
cryptogen generate --config=./config/crypto-config.yaml --output=./config/crypto-config
configtxgen -outputBlock  ./config/orderer/LogisticOrdererGenesis.block -channelID ordererchannel  -profile LogisticOrdererGenesis
configtxgen -outputCreateChannelTx  ./config/logisticschannel.tx -channelID logisticschannel  -profile LogisticsChannel
docker-compose up -d
#docker-compose down
export CORE_PEER_LOCALMSPID="OemMSP"
export FABRIC_LOGGING_SPEC=INFO
export FABRIC_CFG_PATH=$PWD/config/oem
export CORE_PEER_ADDRESS=peer1.oem.com:7051
export CORE_PEER_MSPCONFIGPATH=$PWD/config/crypto-config/peerOrganizations/oem.com/users/Admin@oem.com/msp
export ORDERER_ADDRESS=orderer.oem.com:7050
peer channel create -c logisticschannel -f ./config/logisticschannel.tx --outputBlock ./config/orderer/LogisticOrdererGenesis.block -o $ORDERER_ADDRESS

# if [ "$ORG_CONTEXT" == "budget" ]; then
#     # Native binary uses the local port on VM 
#     export CORE_PEER_ADDRESS=peer1.$1.com:8051
# fi
# ./bins/submit-channel-create.sh
# ./bins/join-channel.sh
# ./bins/anchor-update.sh