"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Po class for capturing PO object
const po_1 = require("./po");
// Needed for storing the Carids against po line. 
// Just for the purpose of the POC. 
// Instead of assigning the cars manually against PO line orders, 
// we saved them in the ledger (not recommended) 
// so that we can assign them direcly while creating the Sales Order
const PoSlVhidArr_1 = require("./PoSlVhidArr");
// This function is used to read the Po from the Ledger and return a Po object.
// This function is used in the modules: createCarAsset, createSalesOrder
async function readPo(po_contract, poId) {
    try {
        // The Po is read in the JSON foramt
        // Due to the complex nature of the JSON, the whole JSON object is getting considered as a single value
        // need to drill down to the specific value and parse it to PO object.
        let po = new po_1.Po;
        po = JSON.parse(await readPoJSON(po_contract, poId));
        // returns a Po Object back to the caller
        return po;
    }
    catch (error) {
        console.log(error);
        console.log('Error in lib.ts readPo');
    }
}
exports.readPo = readPo;
// This function is used to read the Po from the Ledger and return the result as a string
async function readPoJSON(po_contract, poId) {
    try {
        // Query the chaincode
        let orders = await po_contract.evaluateTransaction('readPoAsset', poId);
        //console.log(orders.toString());
        return orders.toString();
    }
    catch (error) {
        console.log(error);
    }
}
// This is a sleep function used to introduce a delay before reading the ledger immediatly after invoking.
exports.sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};
// The below function is used to read the cars array which are saved to get autoassigned
// while creating the Sales Order. 
// This is used in Module createCarAsset.
async function readCarsAutoAssigned(car_contract, poId, po) {
    await exports.sleep(2000);
    // console.log("====Print the Vhids which can be autoassigned to each Sales Order Line====");
    for (let i = 0; i < po.orders.length; i++) {
        //console.log("P" + poId + "S" + po.orders[i].order_sno + " : " + await readCarPoSlVn(car_contract, "P" + poId + "S" + po.orders[i].order_sno));
    }
}
exports.readCarsAutoAssigned = readCarsAutoAssigned;
// This function is used to change the Po status.
// If the Po object is not passed, then the Po is read from the ledger and
async function changePoStatus(po_contract, functionName, poId, po) {
    // This flags says whether we are passing po object to the chaincode
    let poExists = 'Y';
    if (Object.keys(po).length === 0) {
        poExists = 'N';
        //po = await readPo(po_contract, poId);
    }
    //console.log(`JSON.stringify(po) : ${JSON.stringify(po)},poExists : ${poExists}`);
    let response = await po_contract.submitTransaction(functionName, poId, JSON.stringify(po), poExists);
    console.log(JSON.stringify(po));
}
exports.changePoStatus = changePoStatus;
// This finction is internally/externally used to read the ledger cars array
// This can be autoassigned against SO Line while creating the sales order.
// This function is used in createSalesOrder
async function readCarPoSlVn(po_contract, poId) {
    try {
        // Query the chaincode
        let orders = await po_contract.evaluateTransaction('readCarPoSlVn', poId);
        return orders.toString();
    }
    catch (error) {
        console.log(error);
    }
}
exports.readCarPoSlVn = readCarPoSlVn;
// The Below code is used to auto assign the Vhicles against Sales Order Line. This will create a string arrary
// and store it in the ledger. This will be read and inserted into Sales Order. We can comment
// The below code if we do the assignment using a program 
// This is used in Module createCarAsset.
async function prepareSoLineVhid(car_contract, PoSl, VhidArr) {
    let po_Sl_Vhids = '';
    let PoSlVhidArrObj = new PoSlVhidArr_1.PoSlVhidArr;
    PoSlVhidArrObj.VhIds = VhidArr;
    po_Sl_Vhids = JSON.stringify(PoSlVhidArrObj);
    await CarsubmitPoSlVhids(car_contract, PoSl, po_Sl_Vhids);
}
exports.prepareSoLineVhid = prepareSoLineVhid;
// This function is internally called from prepareSoLineVhid
async function CarsubmitPoSlVhids(car_contract, Vhid, po_Sl_Vhids) {
    try {
        // Submit the transaction
        let response = await car_contract.submitTransaction('insertPoSlVn', Vhid, po_Sl_Vhids);
        //console.log('CarsubmitPoSlVhids: Submit Response success: Vhid: ' + Vhid + '  po_Sl_Vhids : ' + po_Sl_Vhids);
    }
    catch (error) {
        // fabric-network.TimeoutError
        console.log(error);
        console.log(' Error in CarsubmitPoSlVhids');
    }
}
//# sourceMappingURL=lib.js.map