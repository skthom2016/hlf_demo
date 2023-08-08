import { Contract } from 'fabric-network';
import { Po } from './po';
export declare function readPo(po_contract: Contract, poId: string): Promise<Po>;
export declare const sleep: (milliseconds: any) => Promise<unknown>;
export declare function readCarsAutoAssigned(car_contract: Contract, poId: string, po: Po): Promise<void>;
export declare function changePoStatus(po_contract: Contract, functionName: string, poId: string, po: Po): Promise<void>;
export declare function readCarPoSlVn(po_contract: Contract, poId: string): Promise<string>;
export declare function prepareSoLineVhid(car_contract: Contract, PoSl: string, VhidArr: string[]): Promise<void>;
