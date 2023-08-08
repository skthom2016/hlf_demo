export CORE_PEER_LOCALMSPID="DealerMSP"
export FABRIC_LOGGING_SPEC=INFO
export FABRIC_CFG_PATH=$PWD/config/dealer
export CORE_PEER_ADDRESS=peer1.dealer.com:8051
export CORE_PEER_MSPCONFIGPATH=$PWD/config/crypto-config/peerOrganizations/dealer.com/users/Admin@dealer.com/msp
export ORDERER_ADDRESS=orderer.oem.com:7050
export CORE_PEER_TLS_ENABLED=false