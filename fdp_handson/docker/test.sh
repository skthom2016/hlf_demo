
cd ~/fdp_handson/docker
. ./setOemEnv.sh
. ./setUserOem.sh 
cd ./clientapp/typescript/src/
echo "=========================="
echo "Oem submits the So 2 using  app submitSalesOrder.ts"
echo "=========================="
askProceed 
node submitSalesOrder.js 2 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'

echo "=========================="
echo "Dealer creates GRN  using app createGRN.ts"
echo "=========================="
askProceed 
cd ./clientapp/typescript/src/
node createGRN.js 2 2 Y $APP_USER_ID
sleep 2 
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'
cd ~/fdp_handson/docker
. ./setDealerEnv.sh
. ./setUserDealer.sh 
cd ./clientapp/typescript/src/


echo "=========================="
echo "Dealer pays invoice  using app payInvoice.ts"
echo "=========================="
askProceed 
node payInvoice.js 1 $APP_USER_ID
sleep 2
echo "Po status is:"
peer chaincode query -C logisticschannel -n PoAssetContract -c '{"Args":["readPoStatus","1"]}'


