import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { PoAsset } from './po-asset';

// variables used for the authorised users. This can be replaced with certificate attributes.
let DealerMSP: string = 'DealerMSP';
let OemMSP: string = 'OemMSP';

@Info({ title: 'PoAssetContract', description: 'My Smart Contract' })
export class PoAssetContract extends Contract {



    @Transaction(false)
    @Returns('boolean')
    public async poAssetExists(ctx: Context, poAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(poAssetId);
        return (!!buffer && buffer.length > 0);
    }

    // This function does all the error validations in one go. 
    // 1. checks whether the Po exists
    // 2. Checks whether the current state can be changed to the new state
    // 3. checks whether the current user is an authorised user to perform this change
    @Transaction(false)
    @Returns('PoAsset')
    public async canPoChangeState(ctx: Context, poAssetId: string, currentState: string,
        newState: string, authorisedUser: string): Promise<PoAsset> {

        // Stores the PO Asset
        let poAsstObj: PoAsset = new PoAsset;
        const buffer = await ctx.stub.getState(poAssetId);

        // check if Po exists else Throw error
        if (!(!!buffer && buffer.length > 0)) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }

        // Assigns the Po Object if PO exists. 
        // No else required as the function errors in the previous step is PO doesn't exists
        if (!!buffer && buffer.length > 0) {
            poAsstObj = JSON.parse(buffer.toString()) as PoAsset;
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
    @Transaction(false)
    @Returns('PoAsset')
    public async canPoCancel(ctx: Context, poAssetId: string, currentState1: string, currentState2: string,
        newState: string, authorisedUser: string): Promise<PoAsset> {

        // Stores the PO Asset
        let poAsstObj: PoAsset = new PoAsset;
        const buffer = await ctx.stub.getState(poAssetId);

        // check if Po exists else Throw error
        if (!(!!buffer && buffer.length > 0)) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }

        // Assigns the Po Object if PO exists. 
        // No else required as the function errors in the previous step is PO doesn't exists
        if (!!buffer && buffer.length > 0) {
            poAsstObj = JSON.parse(buffer.toString()) as PoAsset;
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
    @Transaction(false)
    @Returns('string')
    async getCurrentUserId(ctx: Context): Promise<string> {
        let mspId: string = ctx.clientIdentity.getMSPID();
        return mspId;
    }

    //This function creates a Po asset. The status of the PO asset fully controlled inside the chaincode.
    @Transaction()
    public async createPoAsset(ctx: Context, poAssetId: string, value: string): Promise<void> {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} already exists`);
        }

        // const userid = await this.getCurrentUserId(ctx);
        // if (userid != DealerMSP) {
        //     throw new Error(`The po asset ${poAssetId} can be can be created only by Dealer`);
        // }

        let poAsset = new PoAsset();
        poAsset.value = value;
        poAsset.poStatus = 'Po Created';
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }

    // This function 
    @Transaction()
    public async acceptedPo(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        // currentState and newState hold the values for the Po status check and status change
        let currentState: string = 'Po Created';
        let newState: string = 'Po Inprogress';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = OemMSP;
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }

    @Transaction()
    public async updatePoAsset(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        let currentState: string = 'Po Inprogress';
        let newState: string = 'Po Inprogress';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = ctx.clientIdentity.getMSPID();
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }


    @Transaction()
    public async initiatedPayment(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        let currentState: string = 'Po Inprogress';
        let newState: string = 'Payment Initiated';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }

    @Transaction()
    public async paymentReceived(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        let currentState: string = 'Payment Initiated';
        let newState: string = 'Payment Received';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = OemMSP;
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }


    @Transaction()
    public async closePO(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        let currentState: string = 'Payment Received';
        let newState: string = 'Closed';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoChangeState(ctx, poAssetId, currentState, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }

    @Transaction()
    public async cancelPO(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void> {
        let currentState1: string = 'Po Created';
        let currentState2: string = 'Po Accepted';
        let newState: string = 'Cancelled';

        // This variables stores the value of the authorised user to execute this function
        let authorisedUser: string = DealerMSP;
        // Creates the Po asset object to store values
        let poAsset = new PoAsset();
        // Get the Po asset value from the ledger if the validations are through for poExists,
        // validation for Po state change and the Validation for authorised user.
        poAsset = await this.canPoCancel(ctx, poAssetId, currentState1, currentState2, newState, authorisedUser);
        // Replace the poAsset.value pulled fromt he ledger if the function has received a new value. 
        // if the new value if not paased to the function, i.e poValExists=='N' then proceed with the ledger value.
        if (poValExists == 'Y') poAsset.value = value;

        poAsset.poStatus = newState;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }

    // This function is used to read the POAsset.
    @Transaction(false)
    @Returns('string')
    public async readPoAsset(ctx: Context, poAssetId: string): Promise<string> {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (!exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }

        const buffer = await ctx.stub.getState(poAssetId);
        let poAsset = JSON.parse(buffer.toString()) as PoAsset;
        return poAsset.value;
    }

    // This function is used for initialising the contract.
    @Transaction()
    public async initPoAsset(ctx: Context, poAssetId: string, newValue: string): Promise<void> {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} exists`);
        }

        let poAsset = new PoAsset();
        poAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(poAsset));
        await ctx.stub.putState(poAssetId, buffer);
    }


    // This function reads the Current PoStatus.
    @Transaction(false)
    @Returns('string')
    public async readPoStatus(ctx: Context, poAssetId: string): Promise<string> {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (!exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }

        const buffer = await ctx.stub.getState(poAssetId);
        let poAsset = JSON.parse(buffer.toString()) as PoAsset;
        return poAsset.poStatus;
    }

    @Transaction()
    public async deletePoAsset(ctx: Context, poAssetId: string): Promise<void> {
        const exists = await this.poAssetExists(ctx, poAssetId);
        if (exists) {
            throw new Error(`The po asset ${poAssetId} does not exist`);
        }
        await ctx.stub.deleteState(poAssetId);
    }

}
