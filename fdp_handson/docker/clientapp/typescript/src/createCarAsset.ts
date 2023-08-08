// Import gateway class
import { Gateway, FileSystemWallet, Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Po class for capturing PO object
import { Po } from './po';
// Needed for creating order object in the PO.
import { Order } from './order';
//library used for common functions
import { readPo, readCarsAutoAssigned, prepareSoLineVhid, changePoStatus } from './lib';
// Needed for creating car object.
import { Car } from './car';

// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
//const USER_ID = 'Admin@oem.com'
let USER_ID: string = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const PO_CONTRACT_ID = "PoAssetContract";
const CAR_CONTRACT_ID = "carContract";

// 1. Create an instance of the gatway
const gateway = new Gateway();


main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let poId: string;
        // poid and User id is captured from the command prompt
        if (process.argv.length > 1) {
            poId = process.argv[2];
            USER_ID = process.argv[3];
            console.log('USER_ID: ' + USER_ID);
        } else {
            // Car can be created only by the Oem. if no input provided, then 
            // the user will be set to OEM  
            poId = '1';
            USER_ID = 'Admin@oem.com';
        }
        console.log('poId=' + poId);
        // 2. Setup the gateway object
        await setupGateway();
        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        // 4. Get the contract
        const po_contract = await network.getContract(PO_CONTRACT_ID);
        const car_contract = await network.getContract(CAR_CONTRACT_ID);
        // read the PO
        let po: Po = new Po;
        po = await readPo(po_contract, poId);
        //changes the Po Status to Po Accepted
        await changePoStatus(po_contract,'acceptedPo',poId,po);

        //Create Car assets for each po line requested quantity.
        for (let i = 0; i < po.orders.length; i++) {
            // This function will create the car assets againt the requested PO and stores in the ledger.
            // Vehicle Id is created by concatinating POid , Po line and quantity numbers (0 to n)
            await createCarAssets(car_contract, po.orders[i], "P" + poId + "S" + po.orders[i].order_sno);
        }

        // The below function is used to read the cars array which are saved to get autoassigned
        // while creating the Sales Order. This can be commented. 
        await readCarsAutoAssigned(car_contract, poId, po);

        // 5. Execute the transaction
        //await submitTxncontract(car_contract,orderJson);
        await gateway.disconnect();

    } catch (error) {
        console.log(error);
        console.log('error in createCarAsset main()');
    }
}



// This function will create the car assets againt the requested PO and stores in the ledger.
// Paramenters
// car_contract : This is the car contract object used to interact with the ledger
// item: This represent each Po line. The cars will be created as per the Po order
// 
async function createCarAssets(car_contract: Contract, item: Order, PoSl: string) {

    //    let po_Sl_Vhids: string = '';
    let VhidArr: string[] = [];

    try {
        for (let i = 0; i < item.qty; i++) {
            // Creating the car onject to store the details to the car asset created.
            let car = new Car;

            // This will be the Car Aeest Key.
            // Vhid is created with Poid + Po line number + 0 to number of quatity mentioned in the po.
            let Vhid = PoSl + "L" + i;

            // Assign the details from the po Order Object as mentioned the Po. 
            // here are we are creating the requested asstet mentioned in the PO.
            car.make = item.make;
            car.model = item.model_name;
            car.color = item.colour
            // Registration is mentioned as TEMP till a registation number is provided from the 
            // Registration office.
            car.RegNo = 'TEMP';

            // The Vehicle is stored in an array which can be mapped to PO lines
            // for assigning it to Sales Order. This is just for the convenient purpose of the POC
            VhidArr.push(Vhid);

            // The below will create the Car Assets and store it in the Ledger
            console.log('Created Car Asset:\n Vhid: ' + Vhid + '\n' + JSON.stringify(car));
            await CarsubmitTxnContract(car_contract, Vhid, JSON.stringify(car));

        }

        // The Below code is used to auto assign the Vhicles against Sales Order Line. This will create a string arrary
        // and store it in the ledger. This will be read and inserted into Sales Order. We can comment
        // The below code if we do the assignment using a program
        await prepareSoLineVhid(car_contract,PoSl,VhidArr);
    }
    catch (error) {
        console.log(error);
        console.log('error in createCarAsset createCarAssets()');
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

// This function will create the Car Assets and store it in the Ledger
async function CarsubmitTxnContract(car_contract: Contract, Vhid: string, orderJson: string) {
    try {

        // Submit the transaction
        let response = await car_contract.submitTransaction('createCarAsset', Vhid, orderJson);
        //console.log("CarsubmitTxnContract: Submit Response success ");
    } catch (error) {
        // fabric-network.TimeoutError
        console.log(error);
        console.log(' Error in CarsubmitTxnContract');
    }
}

