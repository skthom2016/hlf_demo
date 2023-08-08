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
// Sales details class to capture sales order while creating the Sales order
const SalesDetails_1 = require("./SalesDetails");
// This object stores the sales details lines. i.e which Vihicle ids are assigned against each So Line
const PoSlVhidArr_1 = require("./PoSlVhidArr");
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
const CAR_CONTRACT_ID = 'carContract';
// 1. Create an instance of the gatway
const gateway = new fabric_network_1.Gateway();
main();
// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let soId;
        let poId;
        // poid, soId and User id is captured from the command prompt
        if (process.argv.length > 2) {
            soId = process.argv[2];
            poId = process.argv[3];
            USER_ID = process.argv[4];
            console.log('USER_ID: ' + USER_ID);
        }
        else {
            soId = '1';
            poId = '1';
            USER_ID = 'Admin@oem.com';
        }
        // 2. Setup the gateway object
        await setupGateway();
        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const car_contract = await network.getContract(CAR_CONTRACT_ID);
        // Create the Sales order file based on the input soId given
        await createSalesOrderfile(po_contract, car_contract, soId, poId);
        // Close the gateway
        await gateway.disconnect();
    }
    catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}
async function createSalesOrderfile(po_contract, car_contract, soId, poId) {
    try {
        // read the PO
        let po = new po_1.Po;
        po = await lib_1.readPo(po_contract, poId);
        // This object is used to capture the So Line and 
        // the Vehicles assigned against each Po Line order.
        let soSlVhArr = [];
        for (let i = 0; i < po.orders.length; i++) {
            let poSl;
            let tempArr = [];
            poSl = "P" + poId + "S" + po.orders[i].order_sno;
            JSON.parse(await lib_1.readCarPoSlVn(car_contract, poSl), (key, value) => {
                try {
                    if (parseInt(key) >= 0) {
                        // populating the temporary array with the So line Vehicle details
                        tempArr.push(value);
                    }
                }
                catch (error) {
                    console.log(error);
                }
            });
            // object for capturing each So Line
            let soSlVhid = new PoSlVhidArr_1.PoSlVhidArr;
            soSlVhid.order_sno = po.orders[i].order_sno;
            soSlVhid.VhIds = tempArr;
            // Calculating the total amount for each So line. Assumption is that every car is 
            // assumed with unit price of 1000.
            soSlVhid.line_tot = 1000 * tempArr.length;
            soSlVhArr.push(soSlVhid);
        }
        // Sales detail object captures the full Sales Order
        let salesDetailObj = new SalesDetails_1.SalesDetails;
        salesDetailObj.poId = poId;
        salesDetailObj.PoSlVhid = soSlVhArr;
        // calculating the So Total by summing up the line total
        let soTot = 0;
        for (let j = 0; j < soSlVhArr.length; j++) {
            let soSlVhid = new PoSlVhidArr_1.PoSlVhidArr;
            soSlVhid = soSlVhArr[j];
            soTot = soTot + soSlVhid.line_tot;
        }
        salesDetailObj.totalAmount = soTot;
        salesDetailObj.status = 'Open';
        let filepath = "./so" + soId + ".json";
        fs_1.writeFile(filepath, JSON.stringify(salesDetailObj), (error) => {
            if (error) {
                console.log(error);
            }
        });
    }
    catch (error) {
        console.log(error);
    }
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
//# sourceMappingURL=createSalesOrder.js.map