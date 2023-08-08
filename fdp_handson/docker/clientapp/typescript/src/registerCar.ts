// Import gateway class
import { Gateway, FileSystemWallet, Contract } from 'fabric-network';
// Used for parsing the connection profile YAML file
import * as  yaml from 'js-yaml';
// Needed for reading the connection profile as JS object
import * as fs from 'fs';
// Needed for creating car object.
import { Car } from './car';
// needed for sending and receiving data from the client
import axios from 'axios';
// used for writing file
import { writeFileSync } from 'fs'
// custom class for handling Steam
import { Stream } from './Stream'
// used to download file from the server
import * as http from 'http';
// Needed for enforcing delay so that external operations finishes
import { sleep } from './lib';
// Needed for hashing the file
import * as crypto from 'crypto';

// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet. Assigning directly through the program
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
let USER_ID: string = 'Admin@dealer.com';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const CAR_CONTRACT_ID = "carContract";

// 1. Create an instance of the gatway
const gateway = new Gateway();

// this is the hashing algorithm
let algorithm = 'sha256';
let shasum = crypto.createHash(algorithm);

main();

// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let carId: string;
        let owner: string;
        // carId and new owner is captured from the command prompt. 
        if (process.argv.length > 1) {
            carId = process.argv[2];
            owner = process.argv[3];
            console.log('owner: ' + owner);
        } else {
            carId = 'P1S1L0';
            owner = 'New Owner';
        }
        console.log('carId=' + carId);
        // 2. Setup the gateway object
        await setupGateway();
        // 3. Get the network
        let network = await gateway.getNetwork(NETWORK_NAME);
        // 4. Get the contract
        const car_contract = await network.getContract(CAR_CONTRACT_ID);
        // read the Car from the Ledger
        let car: Car = new Car;
        car = JSON.parse(await (await car_contract.evaluateTransaction('readCarAsset', carId)).toString()) as Car;

        // send the car details for resgistering the car to the registration office server
        car = await registerCar(carId, car);
        // downloads the created file from the registration office.
        await downloadFile(carId);
        // enforcing a delay so that the pdf files gets created/ copied in the client file system
        await sleep(4000);
        const filename = __dirname + `/pdf/${carId}.pdf`
        // Converting the file as a base64 string to store in the ledger
        let strFileContent = fs.readFileSync(filename).toString(`base64`);
        fs.close;
        let bitmap = new Buffer(strFileContent, 'base64');
        // write buffer to file
        fs.writeFileSync(__dirname + `/pdf/fromDB_${carId}.pdf`, bitmap);
        fs.close;

        // creating the hash of the file
        shasum.update(strFileContent);
        let hash = shasum.digest('hex');
        // assigning the owner and registration document hash to the car
        car.owner = owner;
        car.docHash = hash;

        console.log(`Printing the car before attaching the file: ` + JSON.stringify(car));

        car.regDocString = strFileContent;
        // Writing the Car JSON to a file for validation. printing on sceen is not possible
        // due to truncation
        fs.writeFile(__dirname + `/pdf/${carId}.json`, JSON.stringify(car), (error) => {
            if (error) {
                console.log(error);
            }
        })
        fs.close;
        // Inserting into the ledger
        let response = await car_contract.submitTransaction('updateCarAsset', carId, JSON.stringify(car));

        //await submitTxncontract(car_contract,orderJson);
        await gateway.disconnect();

    } catch (error) {
        console.log(error);
        console.log('error in registerCar main()');
    }
}

// This function send the data to the registration office server and register the car.
async function registerCar(carId: string, car: Car) : Promise<Car>{
    // car object which handles the car data
    let carRet: Car = new Car;
    // using axios for posing data from the client
    axios
        .post('http://localhost:8080/register/' + carId, car)
        .then(res => {
            carRet = JSON.parse(JSON.stringify(res.data)) as Car;
            // tslint:disable-next-line:no-console
            //console.log(`registerCar: ${JSON.stringify(car1)}`);
        })
        .catch(error => {
            // tslint:disable-next-line:no-console
            console.error('error')
        })
        // enforcing a delay so that the pdf files gets created/ copied in the server file system
        // also the post executes properly.
        await sleep(4000);
        return carRet;
}

// This function downloads the registration file from the registration office server
// the Carid is paased as the parameter. 
async function downloadFile(carId: string) {
    // using http for data transfer
    http.get('http://localhost:8080/' + carId, res => {
        // tslint:disable-next-line:no-console
        console.log(`res.statusCode: ${res.statusCode}`);
        // tslint:disable-next-line:no-console
        console.log(`res.headers["content-type"] : ${res.headers["content-type"]}`);
        if (
            res.statusCode === 200 &&
            res.headers["content-type"] === "application/pdf"
        ) {
            // if sucess and pdf file is transferred, then download the file.
            const clientFile = new Stream();

            res.on("data", chunk => {
                clientFile.push(chunk);
            });

            res.on("end", () => {
                const filename = __dirname + `/pdf/${carId}.pdf`;
                writeFileSync(filename, clientFile.read());
                // tslint:disable-next-line:no-console
                console.log(filename);
            });
        }
        else {
            // tslint:disable-next-line:no-console
            console.log('This program went to else statement');
        }
    });
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


