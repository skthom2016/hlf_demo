import { Po } from './po';

export class ParsePoJSON{ 

    public async parsePo(orderJson:string) : Promise<Po> {
        let po :Po;
        let po1 :Po = JSON.parse( orderJson , (key, value) => {
            if (key=="value") {
                // console.log("typeof(value): " + typeof(value));
                // console.log("Key: " + key);
                // console.log("value: " + value)
                po = JSON.parse(value) as Po;
                
            };
            // log the current property name, the last is "".
            //return value;     // return the unchanged property value.
        });
            return po;   
    }

}