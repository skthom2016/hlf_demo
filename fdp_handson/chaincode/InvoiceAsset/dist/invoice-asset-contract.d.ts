import { Context, Contract } from 'fabric-contract-api';
export declare class InvoiceAssetContract extends Contract {
    invoiceAssetExists(ctx: Context, invoiceAssetId: string): Promise<boolean>;
    createInvoiceAsset(ctx: Context, invoiceAssetId: string, value: string): Promise<void>;
    readInvoiceAsset(ctx: Context, invoiceAssetId: string): Promise<string>;
    updateInvoiceAsset(ctx: Context, invoiceAssetId: string, newValue: string): Promise<void>;
    deleteInvoiceAsset(ctx: Context, invoiceAssetId: string): Promise<void>;
}
