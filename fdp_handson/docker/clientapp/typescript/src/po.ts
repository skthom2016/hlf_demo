// Needed to capture the PO lines
import { Order } from './order';

export class Po {
    // Order object stores the PO line details
    public orders: Order[];

    // Sales order array stores the sales order details
    public so: string[];

    // Goods received note stores the GRN numbers
    public grn: string[];

    // Stores the invoce nuber against the po
    public invoice: string;

    // This flag says whether all the PO lines are fully delivered.
    public allDelivered: string;

}
