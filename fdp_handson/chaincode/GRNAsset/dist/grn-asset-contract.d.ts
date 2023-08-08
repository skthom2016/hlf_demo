import { Context, Contract } from 'fabric-contract-api';
import { GrnAsset } from './grn-asset';
export declare class GrnAssetContract extends Contract {
    grnAssetExists(ctx: Context, grnAssetId: string): Promise<boolean>;
    createGrnAsset(ctx: Context, grnAssetId: string, value: string): Promise<void>;
    readGrnAsset(ctx: Context, grnAssetId: string): Promise<GrnAsset>;
    updateGrnAsset(ctx: Context, grnAssetId: string, newValue: string): Promise<void>;
    deleteGrnAsset(ctx: Context, grnAssetId: string): Promise<void>;
}
