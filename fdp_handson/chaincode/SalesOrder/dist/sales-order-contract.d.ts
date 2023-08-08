import { Context, Contract } from 'fabric-contract-api';
export declare class SalesOrderContract extends Contract {
    getCurrentUserId(ctx: Context): Promise<string>;
    salesOrderExists(ctx: Context, salesOrderId: string): Promise<boolean>;
    createSalesOrder(ctx: Context, salesOrderId: string, value: string): Promise<void>;
    readSalesOrder(ctx: Context, salesOrderId: string): Promise<string>;
    updateSalesOrder(ctx: Context, salesOrderId: string, newValue: string): Promise<void>;
    deleteSalesOrder(ctx: Context, salesOrderId: string): Promise<void>;
    readctxProp(ctx: Context): Promise<string>;
}
