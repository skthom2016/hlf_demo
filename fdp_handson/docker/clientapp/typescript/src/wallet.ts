import { FileSystemWallet,Gateway, X509WalletMixin} from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';


// Location of the crypto 
const CRYPTO_CONFIG = path.resolve(__dirname, '../../../config/crypto-config');
const CRYPTO_CONFIG_PEER_ORGS = path.join(CRYPTO_CONFIG, 'peerOrganizations');

// Folder for creating the wallet - All identities written under this
const WALLET_FOLDER = './user-wallet'

// Create an instance of the file system wallet
const wallet = new FileSystemWallet(WALLET_FOLDER);

function main(){

    try {
            
            let action: string;
            let org: string;
            let user: string;
            let arglen: number;

                // Get the requested action
                action='list'
                arglen = process.argv.length;
                if (arglen > 2){
                    action = process.argv[2];
                    org = process.argv[3];
                    user = process.argv[4];
                    //user=user.charAt(0).toUpperCase() + user.slice(1);
                }
                
                // Check on the action requested by user
                // list all the wallets
                if(action == 'list'){
                    console.log("List of identities in wallet:");
                    listIdentities();
                // creates a new wallet
                } else if (action == 'add'){
                    if(arglen<5){
                        console.log("For 'add' & 'export' - Org & User are needed!!!");
                        process.exit(1);
                    }
                    else {
                        addToWallet(org, user);
                        console.log('Done adding/updating.');
                    } 
                } 
        } catch (error) {
            console.error(`Failed to enroll admin user "admin": ${error}`);
            process.exit(1);
        }
}
/**
 * Lists/Prints the identities in the wallet
 */
async function listIdentities(): Promise <void>{
    console.log("Identities in Wallet:");

    // Retrieve the identities in folder
    let list = await wallet.list();
 
    // Loop through the list & print label
    for(let i=0; i < list.length; i++) {
         console.log((i+1)+'. '+list[i].label);
    }
 
 }

async function addToWallet(org: string, user: string): Promise <void>
{
let cert : string;
let key : string;
    // Read the cert & key file content
    try {
        // Read the certificate file content
        cert = readCertCryptogen(org, user);

        // Read the keyfile content
        key = readPrivateKeyCryptogen(org, user);

    } catch (error) {
        // No point in proceeding if the Certificate | Key can't be read
        console.log("Error reading certificate or key!!! "+org+"/"+user)
        process.exit(1)
    }

    // Create the MSP ID
    let mspId = org.charAt(0).toUpperCase() + org.slice(1) + 'MSP';

    // Create the label
    const identityLabel = user+'@'+org+'.com';

    // Create the X509 identity 
    const identity = X509WalletMixin.createIdentity(mspId, cert, key);

    // Add to the wallet
    await wallet.import(identityLabel, identity);
}

/**
 * Reads content of the certificate
 */
function readCertCryptogen(org: string, user: string)
{
    //home/santhosh/fdp_handson/docker/config/crypto-config/peerOrganizations/oem.com/users/Admin@oem.com/msp/signcerts/Admin@oem.com-cert.pem
    try {
        let certPath = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/signcerts/" + user + "@" + org + ".com-cert.pem"
        //console.log(certPath);
        return fs.readFileSync(certPath).toString();;
    } catch(error) {
        console.log('Error in readCertCryptogen');
    }

}


/**
 * Reads the content of users private key
 */
function readPrivateKeyCryptogen(org: string, user: string) {
    ///home/santhosh/fdp_handson/docker/config/crypto-config/peerOrganizations/oem.com/users/Admin@oem.com/msp/keystore/4c33a1db6b6aed3edd03378485b4c17c06676fb043e419f43c54508247750fce_sk
    try {
        let pkFolder = CRYPTO_CONFIG_PEER_ORGS + "/" + org + ".com/users/" + user + "@" + org + ".com/msp/keystore"
        let pkfile;
        //console.log(pkFolder);
        fs.readdirSync(pkFolder).forEach(file => {
            // console.log(file);
            // return the first file
            pkfile = file
            return
        })
        //console.log(pkFolder + "/" + pkfile);
        return fs.readFileSync(pkFolder + "/" + pkfile).toString();
    } catch(error) {
        console.log('Error in readPrivateKeyCryptogen');
}
}

main();
