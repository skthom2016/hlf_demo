import { Context, Contract } from 'fabric-contract-api';
import { PoAsset } from './po-asset';
export declare class PoAssetContract extends Contract {
    poAssetExists(ctx: Context, poAssetId: string): Promise<boolean>;
    canPoChangeState(ctx: Context, poAssetId: string, currentState: string, newState: string, authorisedUser: string): Promise<PoAsset>;
    canPoCancel(ctx: Context, poAssetId: string, currentState1: string, currentState2: string, newState: string, authorisedUser: string): Promise<PoAsset>;
    getCurrentUserId(ctx: Context): Promise<string>;
    createPoAsset(ctx: Context, poAssetId: string, value: string): Promise<void>;
    acceptedPo(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    updatePoAsset(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    initiatedPayment(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    paymentReceived(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    closePO(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    cancelPO(ctx: Context, poAssetId: string, value: string, poValExists: string): Promise<void>;
    readPoAsset(ctx: Context, poAssetId: string): Promise<string>;
    initPoAsset(ctx: Context, poAssetId: string, newValue: string): Promise<void>;
    readPoStatus(ctx: Context, poAssetId: string): Promise<string>;
    deletePoAsset(ctx: Context, poAssetId: string): Promise<void>;
}
