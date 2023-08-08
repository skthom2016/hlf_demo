// Import gateway class
import { Gateway, FileSystemWallet, Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Po class for capturing PO object
import { Po } from './po';
// Sales details class to capture sales order while creating the Sales order
import { SalesDetails } from './SalesDetails'
// GRN Class is used to capture the Goods received Note
import { GRN } from './GRN';
// Common Library
import { readPo, changePoStatus } from './lib';


// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
let USER_ID: string = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const PO_CONTRACT_ID = 'PoAssetContract';
const GRN_CONTRACT_ID = 'GrnAssetContract';
const SO_CONTRACT_ID = 'SalesOrderContract';
// 1. Create an instance of the gatway
const gateway = new Gateway();

main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let soId: string;
        let grnId: string;
        let grnFlag: boolean;

        if (process.argv.length > 2) {
            grnId = process.argv[2];
            soId = process.argv[3];

            if (process.argv[4] == 'Y' || process.argv[4] == 'y') {
                grnFlag = true;
            } else {
                grnFlag = false;
            }

            USER_ID = process.argv[5];
            console.log('USER_ID: ' + USER_ID);
        } else {
            console.log('follow the format node createGRN.js grnId soId USERID. exiting..');
            process.exit(-1); 
        }
        console.log('grnId=' + grnId + ' and soId=' + soId);

        // 2. Setup the gateway object
        await setupGateway();

        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);

        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const grn_contract = await network.getContract(GRN_CONTRACT_ID);
        const so_contract = await network.getContract(SO_CONTRACT_ID);

        // read the sales order from the ledger.
        let salesDetObj: SalesDetails = new SalesDetails;
        salesDetObj = await readSo(so_contract, soId);
        if (salesDetObj.status != 'Open') {
            console.log('The sales order is not open. exiting');
            process.exit(-1); 
        }

        // Creates the GRN and submits to the ledger
        // The GRN will be created only if the grnFlag id true
        // 5. Execute the transaction        
        if (grnFlag) {
            await createGRN(grn_contract, grnId, soId, grnFlag);
            await updatePoSo(po_contract, so_contract, salesDetObj, soId, grnId);
        } else {
            console.log(`GRN not created as the accepted flag is ${process.argv[4]}`)
        }
        await gateway.disconnect();

    } catch (error) {
        console.log(error);
        console.log('error in createGRN main()');
    }
}

// This function reads the sales order from the Ledger
async function readSo(so_contract: Contract, soId: string): Promise<SalesDetails> {
    try {
        // creates the sales detail object for storing the sales details
        let salesDetObj: SalesDetails = new SalesDetails;
        salesDetObj = JSON.parse(await (await so_contract.evaluateTransaction('readSalesOrder', soId)).toString())  as SalesDetails;

        return salesDetObj;
    } catch (error) {
        console.log(error);
        console.log('error in readSo');
    }
}

// This function creates the GRN and inserts it to the ledger
async function createGRN(grn_contract: Contract, grnId: string, soId: string, grnFlag: boolean) {
    try {
        //Creates the GRN object and assigns data
        let grnObj: GRN = new GRN;
        grnObj.soId = soId;
        grnObj.received = grnFlag;
        // inserts grn into the ledger
        let response = await grn_contract.submitTransaction('createGrnAsset', grnId, JSON.stringify(grnObj));
    } catch (error) {
        console.log(error);
        console.log('error in createGRN');
    }

}

// This function inserts the SOid and the grn ID to the PO and changes the PO status to 
async function updatePoSo(po_contract: Contract, so_contract: Contract, salesDetObj: SalesDetails, soId: string, grnId: string) {
    try {

        // read the PO
        let po: Po = new Po;
        po = await readPo(po_contract, salesDetObj.poId);
        
        // Assign the Sales order to the PO as an array. There can be muliple Sales orders.
        let soidArr: string[] = [];
        soidArr = po.so;
        soidArr.push(soId);
        // remove the So duplicates.
        po.so = soidArr.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        })

        
        // Assign the GRN to the PO as an array. There can be muliple GRn.
        let grnArr: string[] = [];
        grnArr = po.grn;
        grnArr.push(grnId);
        // remove the GRN duplicates.
        po.grn = grnArr.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        })
        
        //console.log(`po: ${JSON.stringify(po)}`);
        // Submit the po to the Ledger
        await changePoStatus(po_contract, 'updatePoAsset', salesDetObj.poId, po);
        //console.log(JSON.stringify(po));


        //Update So
        salesDetObj.GRNId=grnId;
        salesDetObj.status ='Closed';
        let response1 = await so_contract.submitTransaction('updateSalesOrder', soId, JSON.stringify(salesDetObj));
        console.log('Updated So with GRN');
    } catch (error) {
        console.log(error);
        console.log('Error in updatePoSo')
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




