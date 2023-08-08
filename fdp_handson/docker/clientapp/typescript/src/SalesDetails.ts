/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { PoSlVhidArr } from './PoSlVhidArr';

export class SalesDetails {
    public poId: string;
    public PoSlVhid: PoSlVhidArr[];
    public GRNId: string;
    public totalAmount : number;
    public status: string;
}
