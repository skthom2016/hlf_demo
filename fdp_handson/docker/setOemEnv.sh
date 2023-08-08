export CORE_PEER_LOCALMSPID="OemMSP"
export FABRIC_LOGGING_SPEC=INFO
export FABRIC_CFG_PATH=$PWD/config/oem
export CORE_PEER_ADDRESS=peer1.oem.com:7051
export CORE_PEER_MSPCONFIGPATH=$PWD/config/crypto-config/peerOrganizations/oem.com/users/Admin@oem.com/msp
export ORDERER_ADDRESS=orderer.oem.com:7050
export CORE_PEER_TLS_ENABLED=false