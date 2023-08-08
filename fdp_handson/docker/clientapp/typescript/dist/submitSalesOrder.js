"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import gateway class
const fabric_network_1 = require("fabric-network");
// Used for parsing the connection profile YAML file
const yaml = require("js-yaml");
// Needed for reading the connection profile as JS object
const fs_1 = require("fs");
// Po class for capturing PO object
const po_1 = require("./po");
// Common Library
const lib_1 = require("./lib");
// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
//const USER_ID = 'Admin@oem.com';
let USER_ID = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const PO_CONTRACT_ID = 'PoAssetContract';
// const CAR_CONTRACT_ID = 'carContract';
const SO_CONTRACT_ID = 'SalesOrderContract';
// 1. Create an instance of the gatway
const gateway = new fabric_network_1.Gateway();
main();
// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let filepath;
        let soId;
        let poId;
        let soString = "";
        // soId,poid and User id is captured from the command prompt
        if (process.argv.length > 2) {
            soId = process.argv[2];
            poId = process.argv[3];
            USER_ID = process.argv[4];
            console.log('USER_ID: ' + USER_ID);
            filepath = "./so" + soId + ".json";
        }
        else {
            USER_ID = 'Admin@oem.com';
            console.log("input format should be node submitSalesOrder soId poId USER_ID");
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
        let po = new po_1.Po;
        await lib_1.changePoStatus(po_contract, 'updatePoAsset', poId, po);
        // 5. Execute the transaction
        await gateway.disconnect();
    }
    catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}
// This function submits the Sales Order to the Ledger
async function submitSoTxn(contract, soId, jsonString) {
    try {
        // Submit the transaction
        let response = await contract.submitTransaction('createSalesOrder', soId, jsonString);
        console.log('Submit SalesOrder success');
        return true;
    }
    catch (error) {
        // fabric-network.TimeoutError
        console.log(error);
        console.log(' Error in submitSalesOrder:submitSoTxn');
        return false;
    }
}
// This function reads the Sales Order to the saved file
async function readSalesOrderfile(filename) {
    let str = "";
    try {
        str = fs_1.readFileSync(filename).toString();
    }
    catch (error) {
        console.log(error);
        str = 'Error in readSalesOrderfile';
    }
    return str;
}
/**
 * Submit the transaction
 */
async function setupGateway() {
    // 2.1 load the connection profile into a JS object
    let connectionProfile = yaml.safeLoad(fs_1.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));
    // 2.2 Need to setup the user credentials from wallet
    const wallet = new fabric_network_1.FileSystemWallet(FILESYSTEM_WALLET_PATH);
    // 2.3 Set up the connection options
    let connectionOptions = {
        identity: USER_ID,
        wallet: wallet,
        discovery: { enabled: false, asLocalhost: true },
        eventHandlerOptions: {
            strategy: null
        }
    };
    // 2.4 Connect gateway to the network
    await gateway.connect(connectionProfile, connectionOptions);
    // console.log( gateway)
}
//# sourceMappingURL=submitSalesOrder.js.map