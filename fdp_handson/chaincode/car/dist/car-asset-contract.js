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
const car_asset_1 = require("./car-asset");
let CarAssetContract = class CarAssetContract extends fabric_contract_api_1.Contract {
    async carAssetExists(ctx, carAssetId) {
        const buffer = await ctx.stub.getState(carAssetId);
        return (!!buffer && buffer.length > 0);
    }
    async createCarAsset(ctx, carAssetId, value) {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (exists) {
            throw new Error(`The car asset ${carAssetId} already exists`);
        }
        // const carAsset = new CarAsset();
        // carAsset.value = value;
        const buffer = Buffer.from(value);
        await ctx.stub.putState(carAssetId, buffer);
    }
    async insertPoSlVn(ctx, carAssetId, value) {
        await ctx.stub.putState(carAssetId, Buffer.from(value.toString()));
    }
    async readCarPoSlVn(ctx, carAssetId) {
        const buffer = await ctx.stub.getState(carAssetId);
        return buffer.toString();
    }
    async readCarAsset(ctx, carAssetId) {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        const buffer = await ctx.stub.getState(carAssetId);
        const carAsset = JSON.parse(buffer.toString());
        return carAsset;
    }
    async updateCarAsset(ctx, carAssetId, newValue) {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        const carAsset = new car_asset_1.CarAsset();
        carAsset.value = newValue;
        const buffer = Buffer.from(JSON.stringify(carAsset));
        await ctx.stub.putState(carAssetId, buffer);
    }
    async deleteCarAsset(ctx, carAssetId) {
        const exists = await this.carAssetExists(ctx, carAssetId);
        if (!exists) {
            throw new Error(`The car asset ${carAssetId} does not exist`);
        }
        await ctx.stub.deleteState(carAssetId);
    }
};
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('boolean'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "carAssetExists", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "createCarAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "insertPoSlVn", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('string'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "readCarPoSlVn", null);
__decorate([
    fabric_contract_api_1.Transaction(false),
    fabric_contract_api_1.Returns('CarAsset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "readCarAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "updateCarAsset", null);
__decorate([
    fabric_contract_api_1.Transaction(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fabric_contract_api_1.Context, String]),
    __metadata("design:returntype", Promise)
], CarAssetContract.prototype, "deleteCarAsset", null);
CarAssetContract = __decorate([
    fabric_contract_api_1.Info({ title: 'CarAssetContract', description: 'Car Smart Contract' })
], CarAssetContract);
exports.CarAssetContract = CarAssetContract;
//# sourceMappingURL=car-asset-contract.js.map