// Using express
import express from "express";
// This is for the file management
import * as fs from 'fs';
// Needed for creating car object.
import { Car } from './car'
// this is for invoking the server process. copy files
import { exec } from "child_process";
// This is for making the process promise.
import * as util from 'util';


// creating the express app
const app = express();
// converting the exec process to promise
const exec1 = util.promisify(exec);
// invoking the OS copy process
async function cpNewFile(id: string) {
  try {
    const { stdout, stderr } = await exec1(`cp ./dist/1.pdf ./dist/${id}.pdf`);
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.error(err);
  };
};
const port = 8080; // default port to listen
let car: Car = new Car();


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
    } else {
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
    car = JSON.parse(data) as Car;
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