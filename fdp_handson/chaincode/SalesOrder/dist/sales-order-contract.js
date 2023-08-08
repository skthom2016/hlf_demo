"use strict";
/*
 * SPDX-License-Identifier: Apache-2.0
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const fabric_contract_api_1 = require("fabric-contract-api");
const sales_order_1 = require("./sales-order");
let DealerMSP = 'DealerMSP';
let OemMSP = 'OemMSP';
let SalesOrderContract = class SalesOrderContract extends fabric_contract_api_1.Contract {
    async getCurrentUserId(ctx) {
        let mspId = ctx.clientIdentity.getMSPID();
        return mspId;
    }
    async salesOrderExists(ctx, salesOrderId) {
        const buffer = await ctx.stub.getState(salesOrderId);
        return (!!buffer && buffer.length > 0);
    }
    async createSalesOrder(ctx, salesOrderId, value) {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (exists) {
            throw new Error(`The sales order ${salesOrderId} already exists`);
        }
        const userid = await this.getCurrentUserId(ctx);
        if (userid != OemMSP) {
            throw new Error(`The po asset ${salesOrderId} can be can be created only by Oem`);
        }
        const salesOrder = new sales_order_1.SalesOrder();
        salesOrder.value = value;
        const buffer = Buffer.from(JSON.stringify(salesOrder));
        await ctx.stub.putState(salesOrderId, buffer);
    }
    async readSalesOrder(ctx, salesOrderId) {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        const buffer = await ctx.stub.getState(salesOrderId);
        const salesOrder = JSON.parse(buffer.toString());
        return salesOrder.value;
    }
    async updateSalesOrder(ctx, salesOrderId, newValue) {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        const salesOrder = new sales_order_1.SalesOrder();
        salesOrder.value = newValue;
        const buffer = Buffer.from(JSON.stringify(salesOrder));
        await ctx.stub.putState(salesOrderId, buffer);
    }
    async deleteSalesOrder(ctx, salesOrderId) {
        const exists = await this.salesOrderExists(ctx, salesOrderId);
        if (!exists) {
            throw new Error(`The sales order ${salesOrderId} does not exist`);
        }
        await ctx.stub.deleteState(salesOrderId);
    }
    async readctxProp(ctx) {
        //let str:string = //'ctx.clientIdentity.getAttributeValue.caller:' + ctx.clientIdentity.getAttributeValue.caller() + '\n \
        let str = 'ctx.clientIdentity.getID.name: ' + ctx.clientIdentity.getID() + '\n \
      ctx.clientIdentity.getMSPID.name: ' + ctx.clientIdentity.getMSPID() + '\n \
      ctx.clientIdentity.getX509Certificate: ' //+ ctx.clientIdentity.getX509Certificate.arguments
        ;
        return str;
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "getCurrentUserId", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "salesOrderExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "createSalesOrder", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "readSalesOrder", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "updateSalesOrder", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "deleteSalesOrder", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context]),
    __metadata("design:returntype", Promise)
], SalesOrderContract.prototype, "readctxProp", null);
SalesOrderContract = __decorate([
    fabric_contract_api_1.Info({ title: 'SalesOrderContract', description: 'My Smart Contract' })
], SalesOrderContract);
exports.SalesOrderContract = SalesOrderContract;
//# sourceMappingURL=sales-order-contract.js.map