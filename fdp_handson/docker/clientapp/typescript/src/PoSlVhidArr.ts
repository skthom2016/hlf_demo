
// This class is used to capture the So Line and the Vehicles assigned against each Po Line order.
// This class is used while initiating payment to check whether the the Po is fully delivered.
export class PoSlVhidArr {
    // used to store the PO line = So line number
    public order_sno: number;
    // used to store the vehicles assigned against each So line
    public VhIds: string[];
    // This is used to compare the po quantity and Sales order quantity in the payInvoice
    public line_tot: number;
}
