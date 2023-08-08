"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fabric_contract_api_1 = require("fabric-contract-api");
const po_asset_1 = require("./po-asset");
// variables used for the authorised users. This can be replaced with certificate attributes.
let DealerMSP = 'DealerMSP';
let OemMSP = 'OemMSP';
let PoAssetContract = class PoAssetContract extends fabric_contract_api_1.Contract {
    async poAssetExists(ctx, poAssetId) {
        const buffer = await ctx.stub.getState(poAssetId);
        return (!!buffer && buffer.length > 0);
    }
    // This function does all the error validations in one go. 
    // 1. checks whether the Po exists
    // 2. Checks whether the current state can be changed to the new state
    // 3. checks whether the current user is an authorised user to perform this change
    async canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser) {
        // Stores the PO Asset
        let poAsstObj = new po_asset_1.PoAsset;
        const buffer = await ctx.stub.getState(poAssetId);
        // check if Po exists else Throw error
        if (!(!!buffer && buffer.length > 0)) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        // Assigns the Po Object if PO exists. 
        // No else required as the function errors in the previous step is PO doesn't exists
        if (!!buffer && buffer.length > 0) {
            poAsstObj = JSON.parse(buffer.toString());
            if (!(poAsstObj.poStatus == currentState)) {
                throw new Error(`The po asset ${poAssetId} can be changed to ${newState} only if the current state is ${currentState}. Po state is ${poAsstObj.poStatus}`);
            }
        }
        // This function will check whether the user is an authorised user.
        const userid = await this.getCurrentUserId(ctx);
        if (userid != authorisedUser) {
            throw new Error(`The po asset ${poAssetId} can be changed to ${newState} only  by ${authorisedUser}. Current user is ${userid}`);
        }
        return poAsstObj;
    }
    // This function does all the error validations in one go. 
    // 1. checks whether the Po exists
    // 2. Checks whether the current state can be changed to the new state
    // 3. checks whether the current user is an authorised user to perform this change
    async canPoCancel(ctx, poAssetId, currentState1, currentState2, newState, authorisedUser) {
        // Stores the PO Asset
        let poAsstObj = new po_asset_1.PoAsset;
        const buffer = await ctx.stub.getState(poAssetId);
        // check if Po exists else Throw error
        if (!(!!buffer && buffer.length > 0)) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        // Assigns the Po Object if PO exists. 
        // No else required as the function errors in the previous step is PO doesn't exists
        if (!!buffer && buffer.length > 0) {
            poAsstObj = JSON.parse(buffer.toString());
            if (!(poAsstObj.poStatus == currentState1 || poAsstObj.poStatus == currentState2)) {
                throw new Error(`The po asset ${poAssetId} can be changed to ${newState} only if the current state is ${currentState1} or ${currentState2}`);
            }
        }
        // This function will check whether the user is an authorised user.
        const userid = await this.getCurrentUserId(ctx);
        if (userid != authorisedUser) {
            throw new Error(`The po asset ${poAssetId} can be changed to ${newState} only  by ${authorisedUser}`);
        }
        return poAsstObj;
    }
    // This function is used to check the login user.
    async getCurrentUserId(ctx) {
        let mspId = ctx.clientIdentity.getMSPID();
        return mspId;
    }
    //This function creates a Po asset. The status of the PO asset fully controlled inside the chaincode.
    async createPoAsset(ctx, poAssetId, value) {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} already exists`);
        }
        // const userid = await this.getCurrentUserId(ctx);
        // if (userid != DealerMSP) {
        //     throw new Error(`The po asset ${poAssetId} can be can be created only by Dealer`);
        // }
        let poAsset = new po_asset_1.PoAsset();
        poAsset.value = value;
        poAsset.poStatus = 'Po Created';
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    // This function 
    async acceptedPo(ctx, poAssetId, value, poValExists) {
        // currentState and newState hold the values for the Po status check and status change
        let currentState = 'Po Created';
        let newState = 'Po Inprogress';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = OemMSP;
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    async updatePoAsset(ctx, poAssetId, value, poValExists) {
        let currentState = 'Po Inprogress';
        let newState = 'Po Inprogress';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = ctx.clientIdentity.getMSPID();
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    async initiatedPayment(ctx, poAssetId, value, poValExists) {
        let currentState = 'Po Inprogress';
        let newState = 'Payment Initiated';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    async paymentReceived(ctx, poAssetId, value, poValExists) {
        let currentState = 'Payment Initiated';
        let newState = 'Payment Received';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = OemMSP;
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    async closePO(ctx, poAssetId, value, poValExists) {
        let currentState = 'Payment Received';
        let newState = 'Closed';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    async cancelPO(ctx, poAssetId, value, poValExists) {
        let currentState1 = 'Po Created';
        let currentState2 = 'Po Accepted';
        let newState = 'Cancelled';
        // This variables stores the value of the authorised user to execute this function
        let authorisedUser = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new po_asset_1.PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoCancel(ctx, poAssetId, currentState1, currentState2, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y')
            poAsset.value = value;
        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    // This function is used to read the POAsset.
    async readPoAsset(ctx, poAssetId) {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (!exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(poAssetId);
        let poAsset = JSON.parse(buffer.toString());
        return poAsset.value;
    }
    // This function is used for initialising the contract.
    async initPoAsset(ctx, poAssetId, newValue) {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} exists`);
        }
        let poAsset = new po_asset_1.PoAsset();
        poAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }
    // This function reads the Current PoStatus.
    async readPoStatus(ctx, poAssetId) {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (!exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(poAssetId);
        let poAsset = JSON.parse(buffer.toString());
        return poAsset.poStatus;
    }
    async deletePoAsset(ctx, poAssetId) {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        await ctx.stub.deleteState(poAssetId);
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "poAssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('PoAsset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "canPoChangeState", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('PoAsset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "canPoCancel", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "getCurrentUserId", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "createPoAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "acceptedPo", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "updatePoAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "initiatedPayment", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "paymentReceived", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "closePO", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "cancelPO", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "readPoAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "initPoAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "readPoStatus", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], PoAssetContract.prototype, "deletePoAsset", null);
PoAssetContract = __decorate([
    fabric_contract_api_1.Info({ title: 'PoAssetContract', description: 'My Smart Contract' })
], PoAssetContract);
exports.PoAssetContract = PoAssetContract;
//# sourceMappingURL=po-asset-contract.js.map