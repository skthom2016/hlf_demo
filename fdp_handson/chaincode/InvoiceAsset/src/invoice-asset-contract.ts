/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { InvoiceAsset } from './invoice-asset';

@Info({title: 'InvoiceAssetContract', description: 'My Smart Contract' })
export class InvoiceAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async invoiceAssetExists(ctx: Context, invoiceAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(invoiceAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createInvoiceAsset(ctx: Context, invoiceAssetId: string, value: string): Promise<void> {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} already exists`);
        }
        const invoiceAsset = new InvoiceAsset();
        invoiceAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(invoiceAsset));
        await ctx.stub.putState(invoiceAssetId, buffer);
    }

    @Transaction(false)
    @Returns('string')
    public async readInvoiceAsset(ctx: Context, invoiceAssetId: string): Promise<string> {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceAssetId);
        const invoiceAsset = JSON.parse(buffer.toString()) as InvoiceAsset;
        return invoiceAsset.value;
    }

    @Transaction()
    public async updateInvoiceAsset(ctx: Context, invoiceAssetId: string, newValue: string): Promise<void> {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        const invoiceAsset = new InvoiceAsset();
        invoiceAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(invoiceAsset));
        await ctx.stub.putState(invoiceAssetId, buffer);
    }

    @Transaction()
    public async deleteInvoiceAsset(ctx: Context, invoiceAssetId: string): Promise<void> {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        await ctx.stub.deleteState(invoiceAssetId);
    }

}
