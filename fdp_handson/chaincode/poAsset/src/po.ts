/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Object, Property } from 'fabric-contract-api';
import {Order} from './order';
@Object()
export class Po {

    @Property()
    //public orders: string;
    public orders: Order[];
    public allDelivered: string;

}
