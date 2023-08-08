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
const grn_asset_1 = require("./grn-asset");
let GrnAssetContract = class GrnAssetContract extends fabric_contract_api_1.Contract {
    async grnAssetExists(ctx, grnAssetId) {
        const buffer = await ctx.stub.getState(grnAssetId);
        return (!!buffer && buffer.length > 0);
    }
    async createGrnAsset(ctx, grnAssetId, value) {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (exists) {
            throw new Error(`The grn asset ${grnAssetId} already exists`);
        }
        const grnAsset = new grn_asset_1.GrnAsset();
        grnAsset.value = value;
        const buffer = Buffer.from(JSON.stringify(grnAsset));
        await ctx.stub.putState(grnAssetId, buffer);
    }
    async readGrnAsset(ctx, grnAssetId) {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(grnAssetId);
        const grnAsset = JSON.parse(buffer.toString());
        return grnAsset;
    }
    async updateGrnAsset(ctx, grnAssetId, newValue) {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        const grnAsset = new grn_asset_1.GrnAsset();
        grnAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(grnAsset));
        await ctx.stub.putState(grnAssetId, buffer);
    }
    async deleteGrnAsset(ctx, grnAssetId) {
        const exists = await this.grnAssetExists(ctx, grnAssetId);
        if (!exists) {
            throw new Error(`The grn asset ${grnAssetId} does not exist`);
        }
        await ctx.stub.deleteState(grnAssetId);
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], GrnAssetContract.prototype, "grnAssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], GrnAssetContract.prototype, "createGrnAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('GrnAsset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], GrnAssetContract.prototype, "readGrnAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], GrnAssetContract.prototype, "updateGrnAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], GrnAssetContract.prototype, "deleteGrnAsset", null);
GrnAssetContract = __decorate([
    fabric_contract_api_1.Info({ title: 'GrnAssetContract', description: 'My Smart Contract' })
], GrnAssetContract);
exports.GrnAssetContract = GrnAssetContract;
//# sourceMappingURL=grn-asset-contract.js.map