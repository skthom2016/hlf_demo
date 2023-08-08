// Import gateway class
import { Gateway, FileSystemWallet, DefaultEventHandlerStrategies, Transaction, Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Po class for capturing PO object
import { Po } from './po';
// Sales details class to capture sales order while creating the Sales order
import { SalesDetails } from './SalesDetails'
// This object stores the sales details lines. i.e which Vihicle ids are assigned against each So Line
import { PoSlVhidArr } from './PoSlVhidArr'
// Common Library
import { changePoStatus, readPo } from './lib';
// Used to calculate the Po line Qty received.
import { PoSlQtyRec } from './PoSlQtyReceved';
// Invoice class to capture Invoice
import { Invoice } from './invoice';

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
const SO_CONTRACT_ID = 'SalesOrderContract';
const INV_CONTRACT_ID = 'InvoiceAssetContract';

// 1. Create an instance of the gatway
const gateway = new Gateway();
let invObj: Invoice = new Invoice;
let po: Po = new Po;

main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let poId: string;
        // poid, soId and User id is captured from the command prompt
        if (process.argv.length > 2) {
            poId = process.argv[2];
            USER_ID = process.argv[3];
            console.log('USER_ID: ' + USER_ID);
        } else {
            console.log('use node payInvoice.js poId USERID');
            process.exit(-1);
        }

        // 2. Setup the gateway object
        await setupGateway();
        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const so_contract = await network.getContract(SO_CONTRACT_ID);
        const inv_contract = await network.getContract(INV_CONTRACT_ID);

        // read the PO
        po = await readPo(po_contract, poId);
        invObj = JSON.parse((await inv_contract.evaluateTransaction('readInvoiceAsset', po.invoice)).toString()) as Invoice;
        console.log('invObj.invoiceStatus:' + invObj.invoiceStatus);
        if (invObj.invoiceStatus != 'Open') {
            console.log(' The invoice is not open');
            process.exit(-1);
        }

        await updatePoReceivedFlag(po_contract, so_contract, inv_contract, poId);
        // 5. Execute the transaction
        await gateway.disconnect();

    } catch (error) {
        console.log(error);
        console.log('error in payInvoice main()');
    }
}

async function updatePoReceivedFlag(po_contract: Contract, so_contract: Contract, inv_contract: Contract, poId: string): Promise<boolean> {
    try {
        //will store the Po line quantity received.
        let PoSlQtyRecObj: PoSlQtyRec[] = [];


        let PoSlVhidArry: PoSlVhidArr[] = [];
        //fill the POSl so that vehicle array can be merged
        for (let i = 0; i < po.orders.length; i++) {
            let PoSlVhid = new PoSlVhidArr;
            PoSlVhid.order_sno = po.orders[i].order_sno;
            PoSlVhid.VhIds = [];
            PoSlVhid.line_tot = po.orders[i].qty;
            PoSlVhidArry.push(PoSlVhid);
        }

        for (let i = 0; i < po.so.length; i++) {

            let salesDetObj: SalesDetails = new SalesDetails;
            // console.log('po.so[i] :' + po.so[i]);
            salesDetObj = JSON.parse((await so_contract.evaluateTransaction('readSalesOrder', po.so[i])).toString()) as SalesDetails;


            for (let j = 0; j < salesDetObj.PoSlVhid.length; j++) {
                if (PoSlVhidArry[j].order_sno == salesDetObj.PoSlVhid[j].order_sno) {
                    //PoSlVhidArry[j].VhIds.concat(salesDetObj.PoSlVhid[j].VhIds);
                    for (let k = 0; k < salesDetObj.PoSlVhid[j].VhIds.length; k++) {
                        PoSlVhidArry[j].VhIds.push(salesDetObj.PoSlVhid[j].VhIds[k]);
                    }

                    // console.log('salesDetObj.PoSlVhid[j].VhIds: ' + salesDetObj.PoSlVhid[j].VhIds);
                } else { console.log('VhIds not assigned'); }
            }
            // console.log('============Populated from Sales Order');
            // console.log('PoSlVhidArry[j].order_sno :' + PoSlVhidArry[i].order_sno); 
            // console.log('PoSlVhidArry[j].line_tot :' + PoSlVhidArry[i].line_tot);                    
            // console.log('PoSlVhidArry[j].VhIds :' + PoSlVhidArry[i].VhIds);
            // console.log('==============');
        }

        //removing duplicates
        for (let i = 0; i < PoSlVhidArry.length; i++) {
            let VhidArry: string[] = [];
            VhidArry = PoSlVhidArry[i].VhIds;
            PoSlVhidArry[i].VhIds = VhidArry.filter(function (elem, index, self) {
                return index === self.indexOf(elem);
            });
            //     console.log('==============Removed Duplicates');
            //     console.log('PoSlVhidArry[j].order_sno :' + PoSlVhidArry[i].order_sno); 
            //     console.log('PoSlVhidArry[j].line_tot :' + PoSlVhidArry[i].line_tot);                    
            //     console.log('PoSlVhidArry[j].VhIds :' + PoSlVhidArry[i].VhIds);
            //     console.log('==============');
        }

        // Seeing each PO line to received by comparing the So line qty Vhid and Po line Qty.
        for (let i = 0; i < po.so.length; i++) {
            if (PoSlVhidArry[i].order_sno == po.orders[i].order_sno &&
                PoSlVhidArry[i].line_tot == PoSlVhidArry[i].VhIds.length) {
                po.orders[i].received = 'Y';
            } else {
                po.orders[i].received = 'N';
            }

            // console.log('PoSlVhidArry[j].order_sno :' + PoSlVhidArry[i].order_sno); 
            // console.log('PoSlVhidArry[j].line_tot :' + PoSlVhidArry[i].line_tot);                    
            // console.log('PoSlVhidArry[j].VhIds :' + PoSlVhidArry[i].VhIds);
            // console.log('po.orders[i].received :' + po.orders[i].received);
            // console.log('==============');
        }

        // make the PO all delivered if all the lines are delivered.
        for (let i = 0; i < po.so.length; i++) {
            po.allDelivered = 'Y';
            if (po.orders[i].received == 'N') {
                console.log(' Po line ' + po.orders[i].order_sno + ' or more are not fully received');
                po.allDelivered = 'N';
                return false;
                break;
            }
        }

        // console.log('po JSON after updation: ' + JSON.stringify(po));
        if (po.allDelivered = 'Y') {

            await changePoStatus(po_contract, 'initiatedPayment', poId, po);
            //let response1 = await po_contract.submitTransaction('updatePoAsset', poId, JSON.stringify(po));
            await closeInv(inv_contract, po.invoice);
            return true;
        }
        console.log('Updated Po with  allreceived: ' + po.allDelivered);


    } catch (error) {
        console.log('Error in updatePoReceivedFlag: ' + error);
        return false;
    }
}

// Close the invoice as the payment is initiated
async function closeInv(inv_contract: Contract, invId: string) {
    try {

        // let invObj: Invoice = new Invoice;
        // invObj = JSON.parse((await inv_contract.evaluateTransaction('readInvoiceAsset', invId)).toString()) as Invoice;
        invObj.invoiceStatus = 'Closed';
        let response = await inv_contract.submitTransaction('updateInvoiceAsset', invId, JSON.stringify(invObj));
    } catch (error) {
        console.log(error);
        console.log('error in payInvoice')
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




