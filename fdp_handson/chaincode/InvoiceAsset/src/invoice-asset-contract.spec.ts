/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { InvoiceAssetContract } from '.';

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

describe('InvoiceAssetContract', () => {

    let contract: InvoiceAssetContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new InvoiceAssetContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"invoice asset 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"invoice asset 1002 value"}'));
    });

    describe('#invoiceAssetExists', () => {

        it('should return true for a invoice asset', async () => {
            await contract.invoiceAssetExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a invoice asset that does not exist', async () => {
            await contract.invoiceAssetExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createInvoiceAsset', () => {

        it('should create a invoice asset', async () => {
            await contract.createInvoiceAsset(ctx, '1003', 'invoice asset 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"invoice asset 1003 value"}'));
        });

        it('should throw an error for a invoice asset that already exists', async () => {
            await contract.createInvoiceAsset(ctx, '1001', 'myvalue').should.be.rejectedWith(/The invoice asset 1001 already exists/);
        });

    });

    describe('#readInvoiceAsset', () => {

        it('should return a invoice asset', async () => {
            await contract.readInvoiceAsset(ctx, '1001').should.eventually.deep.equal({ value: 'invoice asset 1001 value' });
        });

        it('should throw an error for a invoice asset that does not exist', async () => {
            await contract.readInvoiceAsset(ctx, '1003').should.be.rejectedWith(/The invoice asset 1003 does not exist/);
        });

    });

    describe('#updateInvoiceAsset', () => {

        it('should update a invoice asset', async () => {
            await contract.updateInvoiceAsset(ctx, '1001', 'invoice asset 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"invoice asset 1001 new value"}'));
        });

        it('should throw an error for a invoice asset that does not exist', async () => {
            await contract.updateInvoiceAsset(ctx, '1003', 'invoice asset 1003 new value').should.be.rejectedWith(/The invoice asset 1003 does not exist/);
        });

    });

    describe('#deleteInvoiceAsset', () => {

        it('should delete a invoice asset', async () => {
            await contract.deleteInvoiceAsset(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a invoice asset that does not exist', async () => {
            await contract.deleteInvoiceAsset(ctx, '1003').should.be.rejectedWith(/The invoice asset 1003 does not exist/);
        });

    });

});
