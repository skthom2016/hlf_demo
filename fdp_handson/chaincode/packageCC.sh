peer chaincode package -n PoAssetContract -v 0.0.1 -l node -p ../../garage/chaincode/poAsset ../../garage/k8s/nodechaincode/PoAssetContract.cds
peer chaincode package -n carContract -v 0.0.1 -l node -p ../../garage/chaincode/car ../../garage/k8s/nodechaincode/carContract.cds
peer chaincode package -n SalesOrderContract -v 0.0.1 -l node -p ../../garage/chaincode/SalesOrder ../../garage/k8s/nodechaincode/SalesOrderContract.cds
peer chaincode package -n GrnAssetContract -v 0.0.1 -l node -p ../../garage/chaincode/GRNAsset ../../garage/k8s/nodechaincode/GrnAssetContract.cds
peer chaincode package -n InvoiceAssetContract -v 0.0.1 -l node -p ../../garage/chaincode/InvoiceAsset ../../garage/k8s/nodechaincode/InvoiceAssetContract.cds
peer chaincode package -n nodecc -v 0.0.1 -l node -p ../../garage/k8s/nodechaincode/chaincode_example02 ../../garage/k8s/nodechaincode/nodecc.cds
