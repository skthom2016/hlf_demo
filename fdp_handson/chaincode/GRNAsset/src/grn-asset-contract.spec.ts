/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { GrnAssetContract } from '.';

import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import winston = require('winston');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext implements Context {
    public stub: sinon.SinonStubbedInstance<ChaincodeStub> = sinon.createStubInstance(ChaincodeStub);
    public clientIdentity: sinon.SinonStubbedInstance<ClientIdentity> = sinon.createStubInstance(ClientIdentity);
    public logging = {
        getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
        setLevel: sinon.stub(),
     };
}

describe('GrnAssetContract', () => {

    let contract: GrnAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new GrnAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"grn asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"grn asset 1002 value"}'));
    });

    describe('#grnAssetExists', () => {

        it('should return true for a grn asset', async () => {
            await contract.grnAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a grn asset that does not exist', async () => {
            await contract.grnAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createGrnAsset', () => {

        it('should create a grn asset', async () => {
            await contract.createGrnAsset(ctx, '1003', 'grn asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"grn asset 1003 value"}'));
        });

        it('should throw an error for a grn asset that already exists', async () => {
            await contract.createGrnAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The grn asset 1001 already exists/);
        });

    });

    describe('#readGrnAsset', () => {

        it('should return a grn asset', async () => {
            await contract.readGrnAsset(ctx, '1001').should.eventually.deep.equal({ value: 'grn asset 1001 value' });
        });

        it('should throw an error for a grn asset that does not exist', async () => {
            await contract.readGrnAsset(ctx, '1003').should.be.rejectedWith(/The grn asset 1003 does not exist/);
        });

    });

    describe('#updateGrnAsset', () => {

        it('should update a grn asset', async () => {
            await contract.updateGrnAsset(ctx, '1001', 'grn asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"grn asset 1001 new value"}'));
        });

        it('should throw an error for a grn asset that does not exist', async () => {
            await contract.updateGrnAsset(ctx, '1003', 'grn asset 1003 new value').should.be.rejectedWith(/The grn asset 1003 does not exist/);
        });

    });

    describe('#deleteGrnAsset', () => {

        it('should delete a grn asset', async () => {
            await contract.deleteGrnAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a grn asset that does not exist', async () => {
            await contract.deleteGrnAsset(ctx, '1003').should.be.rejectedWith(/The grn asset 1003 does not exist/);
        });

    });

});
