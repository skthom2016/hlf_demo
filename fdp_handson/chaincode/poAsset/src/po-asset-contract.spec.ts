/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { PoAssetContract } from '.';

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

describe('PoAssetContract', () => {

    let contract: PoAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new PoAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"po asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"po asset 1002 value"}'));
    });

    describe('#poAssetExists', () => {

        it('should return true for a po asset', async () => {
            await contract.poAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a po asset that does not exist', async () => {
            await contract.poAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createPoAsset', () => {

        it('should create a po asset', async () => {
            await contract.createPoAsset(ctx, '1003', 'po asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"po asset 1003 value"}'));
        });

        it('should throw an error for a po asset that already exists', async () => {
            await contract.createPoAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The po asset 1001 already exists/);
        });

    });

    describe('#readPoAsset', () => {

        it('should return a po asset', async () => {
            await contract.readPoAsset(ctx, '1001').should.eventually.deep.equal({ value: 'po asset 1001 value' });
        });

        it('should throw an error for a po asset that does not exist', async () => {
            await contract.readPoAsset(ctx, '1003').should.be.rejectedWith(/The po asset 1003 does not exist/);
        });

    });

    describe('#updatePoAsset', () => {

        it('should update a po asset', async () => {
            await contract.updatePoAsset(ctx, '1001', 'po asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"po asset 1001 new value"}'));
        });

        it('should throw an error for a po asset that does not exist', async () => {
            await contract.updatePoAsset(ctx, '1003', 'po asset 1003 new value').should.be.rejectedWith(/The po asset 1003 does not exist/);
        });

    });

    describe('#deletePoAsset', () => {

        it('should delete a po asset', async () => {
            await contract.deletePoAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a po asset that does not exist', async () => {
            await contract.deletePoAsset(ctx, '1003').should.be.rejectedWith(/The po asset 1003 does not exist/);
        });

    });

});
