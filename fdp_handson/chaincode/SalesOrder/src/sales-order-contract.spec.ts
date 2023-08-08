/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Context } from 'fabric-contract-api';
import { ChaincodeStub, ClientIdentity } from 'fabric-shim';
import { SalesOrderContract } from '.';

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

describe('SalesOrderContract', () => {

    let contract: SalesOrderContract;
    let ctx: TestContext;

    beforeEach(() => {
        contract = new SalesOrderContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"sales order 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"sales order 1002 value"}'));
    });

    describe('#salesOrderExists', () => {

        it('should return true for a sales order', async () => {
            await contract.salesOrderExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a sales order that does not exist', async () => {
            await contract.salesOrderExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createSalesOrder', () => {

        it('should create a sales order', async () => {
            await contract.createSalesOrder(ctx, '1003', 'sales order 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"sales order 1003 value"}'));
        });

        it('should throw an error for a sales order that already exists', async () => {
            await contract.createSalesOrder(ctx, '1001', 'myvalue').should.be.rejectedWith(/The sales order 1001 already exists/);
        });

    });

    describe('#readSalesOrder', () => {

        it('should return a sales order', async () => {
            await contract.readSalesOrder(ctx, '1001').should.eventually.deep.equal({ value: 'sales order 1001 value' });
        });

        it('should throw an error for a sales order that does not exist', async () => {
            await contract.readSalesOrder(ctx, '1003').should.be.rejectedWith(/The sales order 1003 does not exist/);
        });

    });

    describe('#updateSalesOrder', () => {

        it('should update a sales order', async () => {
            await contract.updateSalesOrder(ctx, '1001', 'sales order 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"sales order 1001 new value"}'));
        });

        it('should throw an error for a sales order that does not exist', async () => {
            await contract.updateSalesOrder(ctx, '1003', 'sales order 1003 new value').should.be.rejectedWith(/The sales order 1003 does not exist/);
        });

    });

    describe('#deleteSalesOrder', () => {

        it('should delete a sales order', async () => {
            await contract.deleteSalesOrder(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a sales order that does not exist', async () => {
            await contract.deleteSalesOrder(ctx, '1003').should.be.rejectedWith(/The sales order 1003 does not exist/);
        });

    });

});
