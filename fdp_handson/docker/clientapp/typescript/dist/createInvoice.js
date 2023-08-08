"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import gateway class
const fabric_network_1 = require("fabric-network");
// Used for parsing the connection profile YAML file
const yaml = require("js-yaml");
// Needed for reading the connection profile as JS object
const fs = require("fs");
// Po class for capturing PO object
const po_1 = require("./po");
// Invoice class to capture Invoice
const invoice_1 = require("./invoice");
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
const INV_CONTRACT_ID = 'InvoiceAssetContract';
// 1. Create an instance of the gatway
const gateway = new fabric_network_1.Gateway();
main();
// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let invId;
        let poId;
        // Invoiceid, poId and User id is captured from the command prompt
        if (process.argv.length > 2) {
            invId = process.argv[2];
            poId = process.argv[3];
            USER_ID = process.argv[4];
            console.log('USER_ID: ' + USER_ID);
        }
        else {
            console.log('use node createInvoice.js invId poId USERID. Exiting..');
            process.exit(-1);
        }
        // 2. Setup the gateway object
        await setupGateway();
        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const inv_contract = await network.getContract(INV_CONTRACT_ID);
        // 5. Generate and Execute the transaction
        await generateInvUpdPo(po_contract, inv_contract, poId, invId);
        await gateway.disconnect();
    }
    catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}
async function generateInvUpdPo(po_contract, inv_contract, poId, invId) {
    try {
        //Update PO
        let invTotal = 0;
        let invObj = new invoice_1.Invoice;
        // read the PO
        let po = new po_1.Po;
        po = await lib_1.readPo(po_contract, poId);
        po.invoice = invId;
        // Calculating the invoice total
        for (let i = 0; i < po.orders.length; i++) {
            invTotal = invTotal + po.orders[i].qty * 700000;
        }
        invObj.poId = poId;
        invObj.invoiceAmount = invTotal;
        invObj.invoiceStatus = 'Open';
        console.log(JSON.stringify(invObj));
        // Save the invoice to the ledger.
        let response = await inv_contract.submitTransaction('createInvoiceAsset', invId, JSON.stringify(invObj));
        console.log('Created Invoice');
        // change the Po status to Sales order created
        console.log(JSON.stringify(po));
        await lib_1.changePoStatus(po_contract, 'updatePoAsset', poId, po);
        console.log('Updated Po with Invoice');
    }
    catch (error) {
        console.log(error);
        console.log('Error in updatePoSo');
    }
}
/**
 * Submit the transaction
 */
async function setupGateway() {
    // 2.1 load the connection profile into a JS object
    let connectionProfile = yaml.safeLoad(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));
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
//# sourceMappingURL=createInvoice.js.map