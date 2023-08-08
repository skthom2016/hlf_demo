"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParsePoJSON {
    async parsePo(orderJson) {
        let po;
        let po1 = JSON.parse(orderJson, (key, value) => {
            if (key == "value") {
                // console.log("typeof(value): " + typeof(value));
                // console.log("Key: " + key);
                // console.log("value: " + value)
                po = JSON.parse(value);
            }
            ;
            // log the current property name, the last is "".
            //return value;     // return the unchanged property value.
        });
        return po;
    }
}
exports.ParsePoJSON = ParsePoJSON;
//# sourceMappingURL=parsePoJSON.js.map