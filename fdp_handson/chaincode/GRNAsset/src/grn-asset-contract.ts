/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { GrnAsset } from './grn-asset';

@Info({title: 'GrnAssetContract', description: 'My Smart Contract' })
export class GrnAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async grnAssetExists(ctx: Context, grnAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(grnAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createGrnAsset(ctx: Context, grnAssetId: string, value: string): Promise<void> {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (exists) {
            throw new Error(`The grn asset ${grnAssetId} already exists`);
        }
        const grnAsset = new GrnAsset();
        grnAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(grnAsset));
        await ctx.stub.putState(grnAssetId, buffer);
    }

    @Transaction(false)
    @Returns('GrnAsset')
    public async readGrnAsset(ctx: Context, grnAssetId: string): Promise<GrnAsset> {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(grnAssetId);
        const grnAsset = JSON.parse(buffer.toString()) as GrnAsset;
        return grnAsset;
    }

    @Transaction()
    public async updateGrnAsset(ctx: Context, grnAssetId: string, newValue: string): Promise<void> {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        const grnAsset = new GrnAsset();
        grnAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(grnAsset));
        await ctx.stub.putState(grnAssetId, buffer);
    }

    @Transaction()
    public async deleteGrnAsset(ctx: Context, grnAssetId: string): Promise<void> {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        await ctx.stub.deleteState(grnAssetId);
    }

}
