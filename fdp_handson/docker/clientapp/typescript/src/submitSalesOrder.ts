// Import gateway class
import { Gateway, FileSystemWallet, DefaultEventHandlerStrategies, Transaction, Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import {readFileSync} from 'fs';
// Po class for capturing PO object
import { Po } from './po';
// Common Library
import {changePoStatus } from './lib';

// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
//const USER_ID = 'Admin@oem.com';
let USER_ID : string = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const PO_CONTRACT_ID = 'PoAssetContract';
// const CAR_CONTRACT_ID = 'carContract';
const SO_CONTRACT_ID = 'SalesOrderContract';


// 1. Create an instance of the gatway
const gateway = new Gateway();

main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let filepath: string;
        let soId:string;
        let poId:string;
        let soString:string = "";
        // soId,poid and User id is captured from the command prompt
        if (process.argv.length > 2) {
            soId = process.argv[2];
            poId = process.argv[3];
            USER_ID = process.argv[4];
            console.log('USER_ID: ' + USER_ID);
            filepath = "./so" + soId + ".json";
        } else {
            USER_ID = 'Admin@oem.com';
            console.log("input format should be node submitSalesOrder soId poId USER_ID")
            process.exit(-1); 
        }
        console.log('soId=' + soId + ' and poId=' + poId);

        // 2. Setup the gateway object
        await setupGateway();

        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        
        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const so_contract = await network.getContract(SO_CONTRACT_ID);
        
        //read the  SO file
        soString = await readSalesOrderfile(filepath);
        // Submit the transaction
        let success = await submitSoTxn(so_contract, soId, soString);
        // change the Po status to Sales order created
        let po:Po= new Po;
        await changePoStatus(po_contract,'updatePoAsset',poId,po);
        // 5. Execute the transaction
        await gateway.disconnect();

    } catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}


// This function submits the Sales Order to the Ledger
async function submitSoTxn(contract:Contract,soId:string, jsonString:string)
    {
    try{
        // Submit the transaction
        let response = await contract.submitTransaction('createSalesOrder', soId, jsonString);
        console.log('Submit SalesOrder success');
        return true;
    } catch(error){
        // fabric-network.TimeoutError
        console.log(error);
        console.log(' Error in submitSalesOrder:submitSoTxn');
        return false;
    }
}

// This function reads the Sales Order to the saved file
async function readSalesOrderfile(filename: string): Promise<string> {
    let str:string="";
    try {
        str=readFileSync(filename).toString();

     } catch (error) {
        console.log(error);
        str= 'Error in readSalesOrderfile';
   }

return str;    

}

/**
 * Submit the transaction
 */
async function setupGateway() {

    // 2.1 load the connection profile into a JS object
    let connectionProfile = yaml.safeLoad(readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));

    // 2.2 Need to setup the user credentials from wallet
    const wallet = new FileSystemWallet(FILESYSTEM_WALLET_PATH)

    // 2.3 Set up the connection options
    let connectionOptions = {
        identity: USER_ID,
        wallet: wallet,
        discovery: { enabled: false, asLocalhost: true }
        , eventHandlerOptions: {
            strategy: null
        }
    }

    // 2.4 Connect gateway to the network
    await gateway.connect(connectionProfile, connectionOptions)
    // console.log( gateway)
}


