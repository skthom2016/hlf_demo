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
const invoice_asset_1 = require("./invoice-asset");
let InvoiceAssetContract = class InvoiceAssetContract extends fabric_contract_api_1.Contract {
    async invoiceAssetExists(ctx, invoiceAssetId) {
        const buffer = await ctx.stub.getState(invoiceAssetId);
        return (!!buffer && buffer.length > 0);
    }
    async createInvoiceAsset(ctx, invoiceAssetId, value) {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} already exists`);
        }
        const invoiceAsset = new invoice_asset_1.InvoiceAsset();
        invoiceAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(invoiceAsset));
        await ctx.stub.putState(invoiceAssetId, buffer);
    }
    async readInvoiceAsset(ctx, invoiceAssetId) {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(invoiceAssetId);
        const invoiceAsset = JSON.parse(buffer.toString());
        return invoiceAsset.value;
    }
    async updateInvoiceAsset(ctx, invoiceAssetId, newValue) {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        const invoiceAsset = new invoice_asset_1.InvoiceAsset();
        invoiceAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(invoiceAsset));
        await ctx.stub.putState(invoiceAssetId, buffer);
    }
    async deleteInvoiceAsset(ctx, invoiceAssetId) {
        const exists = await this.invoiceAssetExists(ctx, invoiceAssetId);
        if (!exists) {
            throw new Error(`The invoice asset ${invoiceAssetId} does not exist`);
        }
        await ctx.stub.deleteState(invoiceAssetId);
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], InvoiceAssetContract.prototype, "invoiceAssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], InvoiceAssetContract.prototype, "createInvoiceAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], InvoiceAssetContract.prototype, "readInvoiceAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], InvoiceAssetContract.prototype, "updateInvoiceAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], InvoiceAssetContract.prototype, "deleteInvoiceAsset", null);
InvoiceAssetContract = __decorate([
    fabric_contract_api_1.Info({ title: 'InvoiceAssetContract', description: 'My Smart Contract' })
], InvoiceAssetContract);
exports.InvoiceAssetContract = InvoiceAssetContract;
//# sourceMappingURL=invoice-asset-contract.js.map