/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import { CarAsset } from './car-asset';

@Info({title: 'CarAssetContract', description: 'Car Smart Contract' })
export class CarAssetContract extends Contract {

    @Transaction(false)
    @Returns('boolean')
    public async carAssetExists(ctx: Context, carAssetId: string): Promise<boolean> {
        const buffer = await ctx.stub.getState(carAssetId);
        return (!!buffer && buffer.length > 0);
    }

    @Transaction()
    public async createCarAsset(ctx: Context, carAssetId: string, value: string): Promise<void> {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (exists) {
            throw new Error(`The car asset ${carAssetId} already exists`);
        }
        // const carAsset = new CarAsset();
        // carAsset.value = value;
        const buffer = Buffer.from(value);
        await ctx.stub.putState(carAssetId, buffer);
    }

    @Transaction()
    public async insertPoSlVn(ctx: Context, carAssetId: string, value: string): Promise<void> {
        await ctx.stub.putState(carAssetId, Buffer.from(value.toString()));
    }

    @Transaction(false)
    @Returns('string')
    public async readCarPoSlVn(ctx: Context, carAssetId: string): Promise<string> {
        const buffer = await ctx.stub.getState(carAssetId);
        return buffer.toString();
    }

    @Transaction(false)
    @Returns('CarAsset')
    public async readCarAsset(ctx: Context, carAssetId: string): Promise<CarAsset> {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(carAssetId);
        const carAsset = JSON.parse(buffer.toString()) as CarAsset;
        return carAsset;
    }

    @Transaction()
    public async updateCarAsset(ctx: Context, carAssetId: string, newValue: string): Promise<void> {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        const carAsset = new CarAsset();
        carAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(carAsset));
        await ctx.stub.putState(carAssetId, buffer);
    }

    @Transaction()
    public async deleteCarAsset(ctx: Context, carAssetId: string): Promise<void> {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        await ctx.stub.deleteState(carAssetId);
    }

}
