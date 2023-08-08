// Import gateway class
import { Gateway, FileSystemWallet,  Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Po class for capturing PO object
import { Po } from './po';
// Invoice class to capture Invoice
import { Invoice } from './invoice';
// Common Library
import { changePoStatus, readPo } from './lib';


// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
//const USER_ID = 'Admin@oem.com';
let USER_ID: string = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const PO_CONTRACT_ID = 'PoAssetContract';
const INV_CONTRACT_ID = 'InvoiceAssetContract';

// 1. Create an instance of the gatway
const gateway = new Gateway();

main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let invId: string;
        let poId: string;
        // Invoiceid, poId and User id is captured from the command prompt
        if (process.argv.length > 2) {
            invId = process.argv[2];
            poId = process.argv[3];
            USER_ID = process.argv[4];
            console.log('USER_ID: ' + USER_ID);
        } else {
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

    } catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}

async function generateInvUpdPo(po_contract: Contract, inv_contract: Contract, poId: string, invId: string) {
    try {

        //Update PO
        let invTotal: number = 0;
        let invObj: Invoice = new Invoice;
        // read the PO
        let po: Po = new Po;
        po = await readPo(po_contract, poId);
        po.invoice = invId;

        // Calculating the invoice total
        for (let i = 0; i < po.orders.length; i++) {
            invTotal = invTotal + po.orders[i].qty * 1000;
        }

        invObj.poId = poId;
        invObj.invoiceAmount = invTotal;
        invObj.invoiceStatus = 'Open';

        console.log(JSON.stringify(invObj));
        // Save the invoice to the ledger.
        let response = await inv_contract.submitTransaction('createInvoiceAsset', invId, JSON.stringify(invObj));
        console.log('Created Invoice');

        // change the Po status to Sales order created
        await changePoStatus(po_contract,'updatePoAsset',poId,po);
        console.log('Updated Po with Invoice');

    } catch (error) {
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




