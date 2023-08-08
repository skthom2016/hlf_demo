// Import gateway class 
import {Gateway, FileSystemWallet, Contract} from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Needed for creating order object in the PO.
import { Order } from './order';
// Po class for capturing PO object
import { Po } from './po';

// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
let USER_ID : string = '';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const CONTRACT_ID = "PoAssetContract";

// 1. Create an instance of the gatway
const gateway = new Gateway();

main();

// Sets up the gateway | executes the invoke & query
async function main(){
    try {
        let poId:string;

        // poid and User id is captured from the command prompt
        if (process.argv.length>1){
            poId = process.argv[2];
            USER_ID = process.argv[3];
            console.log('USER_ID: ' + USER_ID);

        }else {
        // po can be raised only by the dealer. if no input provided, then 
        // the user will be set to dealer    
            poId ='2';
            USER_ID = 'Admin@dealer.com'
        }
        console.log('poId: ' + poId);

        // 2. Setup the gateway object
        await setupGateway();

        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);

        // 4. Get the contract
        const contract = await network.getContract(CONTRACT_ID);

        // 5. Execute the transaction. insert the Po to the ledger
        await submitPO(contract,poId)

        // 6. disconnect the gateway.
        await gateway.disconnect();

    } catch(error){
        
    }
}

/**
 * Submit the transaction
 */
async function submitPO(contract:Contract,poId:string){
    try{
        // Create the PO automatically for the convenient purpose
        // The function will return the orders as Order object
        let orderobj= await createPoJSON();
        
        // create the po object
        let po = new Po();
        
        // assign the order obj to po object
        po.orders = orderobj;
        
        // initiates the Salease order array in the po object
        po.so=[];

        // initiates the Goods received note array in the po object
        po.grn=[];

        // initiate the invoice string to blank.
        po.invoice=' ';

        // setting the flag to N. The Value will beupdated to Y when all the Po lines are delivered,
        // this will be updated to Y in the payInvoice. 
        // The invoice will be paid only if the PO is fully delivered
        po.allDelivered ='N';

        console.log(JSON.stringify(po));
        // Submit the po transaction to the ledger
        let response = await contract.submitTransaction('createPoAsset', poId,JSON.stringify(po));

    } catch(error){
        // fabric-network.TimeoutError
        console.log(error);
        console.log(' Error in submitTxnContract');
    }
}

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

// This function is used to automatically create the PO in this program.
async function createPoJSON(){

    try {
        // Order obj will take singlr Po line. Order array is used
        // to capture all the po lines.
        // Creating hardcoded PO for the POC purpose
    const orders: Order[] = [
        {
            order_sno: 1,
            make: 'Maruthi',
            model_name: 'Swift',
            colour: 'Blue',
            qty: 5,
            received: 'N',
        },
        {
            order_sno: 2,
            make: 'Maruthi',
            model_name: 'Swift',
            colour: 'Black',
            qty: 3,
            received: 'N',
        },
        {
            order_sno: 3,
            make: 'Maruthi',
            model_name: 'Swift',
            colour: 'Green',
            qty: 2,
            received: 'N',
        },
        {
            order_sno: 4,
            make: 'Maruthi',
            model_name: 'Baleno',
            colour: 'White',
            qty: 5,
            received: 'N',
        },
        {
            order_sno: 5,
            model_name: 'Baleno',
            make: 'Maruthi',
            colour: 'Brown',
            qty: 4,
            received: 'N',
        },
    ];

    // return Order object to the main function.
    return orders;
} catch(error){
    console.log('Error in createPoJSON');
}
}