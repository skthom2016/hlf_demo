import { Context, Contract } from 'fabric-contract-api';
import { CarAsset } from './car-asset';
export declare class CarAssetContract extends Contract {
    carAssetExists(ctx: Context, carAssetId: string): Promise<boolean>;
    createCarAsset(ctx: Context, carAssetId: string, value: string): Promise<void>;
    insertPoSlVn(ctx: Context, carAssetId: string, value: string): Promise<void>;
    readCarPoSlVn(ctx: Context, carAssetId: string): Promise<string>;
    readCarAsset(ctx: Context, carAssetId: string): Promise<CarAsset>;
    updateCarAsset(ctx: Context, carAssetId: string, newValue: string): Promise<void>;
    deleteCarAsset(ctx: Context, carAssetId: string): Promise<void>;
}
