/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { SalesOrder } from './sales-order';
import { createHash } from 'crypto';
let DealerMSP: string = 'DealerMSP';
let OemMSP: string = 'OemMSP';

@Info({title: 'SalesOrderContract', description: 'My Smart Contract' })
export class SalesOrderContract extends Contract {

    @Transaction(false)
    @Returns('string')
    async getCurrentUserId(ctx: Context): Promise<string> {
        let mspId: string = ctx.clientIdentity.getMSPID();
        return mspId;
    }

    @Transaction(false)
    @Returns('boolean')
    public async salesOrderExists(ctx: Context, salesOrderId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(salesOrderId);
        return (!!buffer && buffer.length > 0);
        
    }

    @Transaction()
    public async createSalesOrder(ctx: Context, salesOrderId: string, value: string): Promise<void> {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (exists) {
            throw new Error(`The sales order ${salesOrderId} already exists`);
        }

        const userid = await this.getCurrentUserId(ctx);
        if (userid != OemMSP) {
            throw new Error(`The po asset ${salesOrderId} can be can be created only by Oem`);
        }

        const salesOrder = new SalesOrder();
        salesOrder.value = value;
        const buffer = Buffer.from(JSON.stringify(salesOrder));
        await ctx.stub.putState(salesOrderId, buffer);
    }

    @Transaction(false)
    @Returns('string')
    public async readSalesOrder(ctx: Context, salesOrderId: string): Promise<string> { 
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(salesOrderId);
        const salesOrder = JSON.parse(buffer.toString()) as SalesOrder;
        return salesOrder.value;
    }

    @Transaction()
    public async updateSalesOrder(ctx: Context, salesOrderId: string, newValue: string): Promise<void> {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        const salesOrder = new SalesOrder();
        salesOrder.value = newValue;
        const buffer = Buffer.from(JSON.stringify(salesOrder));
        await ctx.stub.putState(salesOrderId, buffer);
    }

    @Transaction()
    public async deleteSalesOrder(ctx: Context, salesOrderId: string): Promise<void> {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        await ctx.stub.deleteState(salesOrderId);
    }


    @Transaction(false)
    @Returns('string')
    public async readctxProp(ctx: Context): Promise<string> {
      //let str:string = //'ctx.clientIdentity.getAttributeValue.caller:' + ctx.clientIdentity.getAttributeValue.caller() + '\n \
      let str:string = 'ctx.clientIdentity.getID.name: ' + ctx.clientIdentity.getID() + '\n \
      ctx.clientIdentity.getMSPID.name: ' + ctx.clientIdentity.getMSPID() + '\n \
      ctx.clientIdentity.getX509Certificate: ' //+ ctx.clientIdentity.getX509Certificate.arguments
      ;
      
    return str;
    }
}
