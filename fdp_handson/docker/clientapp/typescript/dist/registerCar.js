"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import gateway class
const fabric_network_1 = require("fabric-network");
// Used for parsing the connection profile YAML file
const yaml = require("js-yaml");
// Needed for reading the connection profile as JS object
const fs = require("fs");
// Needed for creating car object.
const car_1 = require("./car");
// needed for sending and receiving data from the client
const axios_1 = require("axios");
// used for writing file
const fs_1 = require("fs");
// custom class for handling Steam
const Stream_1 = require("./Stream");
// used to download file from the server
const http = require("http");
// Needed for enforcing delay so that external operations finishes
const lib_1 = require("./lib");
// Needed for hashing the file
const crypto = require("crypto");
// Constants for profile
const CONNECTION_PROFILE_PATH = '../profiles/logistic-connection.yaml';
// Path to the wallet. Assigning directly through the program
const FILESYSTEM_WALLET_PATH = './user-wallet';
// Identity context used
let USER_ID = 'Admin@dealer.com';
// Channel name
const NETWORK_NAME = 'logisticschannel';
// Chaincode
const CAR_CONTRACT_ID = "carContract";
// 1. Create an instance of the gatway
const gateway = new fabric_network_1.Gateway();
// this is the hashing algorithm
let algorithm = 'sha256';
let shasum = crypto.createHash(algorithm);
main();
// Sets up the gateway | executes the invoke & query
async function main() {
    try {
        let carId;
        let owner;
        // carId and new owner is captured from the command prompt. 
        if (process.argv.length > 1) {
            carId = process.argv[2];
            owner = process.argv[3];
            console.log('owner: ' + owner);
        }
        else {
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
        let car = new car_1.Car;
        car = JSON.parse(await (await car_contract.evaluateTransaction('readCarAsset', carId)).toString());
        // send the car details for resgistering the car to the registration office server
        car = await registerCar(carId, car);
        // downloads the created file from the registration office.
        await downloadFile(carId);
        // enforcing a delay so that the pdf files gets created/ copied in the client file system
        await lib_1.sleep(4000);
        const filename = __dirname + `/pdf/${carId}.pdf`;
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
        });
        fs.close;
        // Inserting into the ledger
        let response = await car_contract.submitTransaction('updateCarAsset', carId, JSON.stringify(car));
        //await submitTxncontract(car_contract,orderJson);
        await gateway.disconnect();
    }
    catch (error) {
        console.log(error);
        console.log('error in registerCar main()');
    }
}
// This function send the data to the registration office server and register the car.
async function registerCar(carId, car) {
    // car object which handles the car data
    let carRet = new car_1.Car;
    // using axios for posing data from the client
    axios_1.default
        .post('http://localhost:8080/register/' + carId, car)
        .then(res => {
        carRet = JSON.parse(JSON.stringify(res.data));
        // tslint:disable-next-line:no-console
        //console.log(`registerCar: ${JSON.stringify(car1)}`);
    })
        .catch(error => {
        // tslint:disable-next-line:no-console
        console.error('error');
    });
    // enforcing a delay so that the pdf files gets created/ copied in the server file system
    // also the post executes properly.
    await lib_1.sleep(4000);
    return carRet;
}
// This function downloads the registration file from the registration office server
// the Carid is paased as the parameter. 
async function downloadFile(carId) {
    // using http for data transfer
    http.get('http://localhost:8080/' + carId, res => {
        // tslint:disable-next-line:no-console
        console.log(`res.statusCode: ${res.statusCode}`);
        // tslint:disable-next-line:no-console
        console.log(`res.headers["content-type"] : ${res.headers["content-type"]}`);
        if (res.statusCode === 200 &&
            res.headers["content-type"] === "application/pdf") {
            // if sucess and pdf file is transferred, then download the file.
            const clientFile = new Stream_1.Stream();
            res.on("data", chunk => {
                clientFile.push(chunk);
            });
            res.on("end", () => {
                const filename = __dirname + `/pdf/${carId}.pdf`;
                fs_1.writeFileSync(filename, clientFile.read());
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
//# sourceMappingURL=registerCar.js.map