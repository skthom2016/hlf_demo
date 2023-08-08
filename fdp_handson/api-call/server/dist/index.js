"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Using express
const express_1 = __importDefault(require("express"));
// This is for the file management
const fs = __importStar(require("fs"));
// Needed for creating car object.
const car_1 = require("./car");
// this is for invoking the server process. copy files
const child_process_1 = require("child_process");
// This is for making the process promise.
const util = __importStar(require("util"));
// creating the express app
const app = express_1.default();
// converting the exec process to promise
const exec1 = util.promisify(child_process_1.exec);
// invoking the OS copy process
function cpNewFile(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { stdout, stderr } = yield exec1(`cp ./dist/1.pdf ./dist/${id}.pdf`);
        }
        catch (err) {
            // tslint:disable-next-line:no-console
            console.error(err);
        }
        ;
    });
}
;
const port = 8080; // default port to listen
let car = new car_1.Car();
// This get is used for downloading the file.
app.get("/:id", (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(`req.params.id: ${req.params.id}`);
    const serverFile = __dirname + `/${req.params.id}.pdf`;
    fs.access(serverFile, fs.constants.F_OK, err => {
        // check that we can access  the file
        // tslint:disable-next-line:no-console
        console.log(`${serverFile} ${err ? "does not exist" : "exists"}`);
    });
    fs.readFile(serverFile, (err, content) => {
        // tslint:disable-next-line:no-console
        console.log(`entered readfile`);
        if (err) {
            res.writeHead(404, { "Content-type": "text/html" });
            res.end("<h1>No such file</h1>");
        }
        else {
            // specify the content type in the response will be an image
            // tslint:disable-next-line:no-console
            console.log(`entered sending file`);
            res.writeHead(200, { "Content-type": "application/pdf" });
            res.end(content);
        }
    });
});
// This function is used to register the car with the registration office.
app.post("/register/:id", (req, res) => {
    // tslint:disable-next-line:no-console
    console.log(`req.params.id: ${req.params.id}`);
    // Creating the registration document, by coping the existing document in the server.
    cpNewFile(req.params.id);
    // processing the received JSON object.
    req.on('data', (data => {
        car = JSON.parse(data);
        const d = new Date();
        // tslint:disable-next-line:no-console
        console.log(`car : ${JSON.stringify(car)}`);
        // assigning the registration number as the current time.
        car.RegNo = (d.getTime()).toString();
        // assigning the registration doc details for this car
        car.regDoc = `${req.params.id}.pdf`;
        // tslint:disable-next-line:no-console
        console.log(`car : ${JSON.stringify(car)}`);
        res.send(JSON.stringify(car));
        // tslint:disable-next-line:no-console
        console.log(`resp car : ${JSON.stringify(car)}`);
    }));
});
// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map