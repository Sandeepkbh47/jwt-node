import { Request, Response, Application } from "express";
import * as jwt from "jsonwebtoken";
import * as express from "express";
const { expressjwt: expressjwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

import * as fs from "fs";
import { validateEmailAndPassword, findUserIdForEmail } from "./dboper";
const app: Application = express();
var corsOptions = {
  origin: "http://localhost:4200",
  credentials: true,
  optionsSuccessStatus: 200,
};
const RSA_PRIVATE_KEY = fs.readFileSync("./system/privateKey.key");
const RSA_PUBLIC_KEY = fs.readFileSync("./system/publicKey.key");
const checkIfAuthenticated = expressjwt({
  secret: RSA_PUBLIC_KEY,
  userProperty: "auth",
  algorithms: ["RS256"],
});
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());

app.route("/api/login").post(loginRoute);
app.route("/api/stats").get(checkIfAuthenticated, stats);
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).send("invalid token...");
  } else {
    next(err);
  }
});
export function loginRoute(req: Request, res: Response) {
  const email = req.body.email,
    password = req.body.password;

  if (validateEmailAndPassword()) {
    const userId = findUserIdForEmail(email);

    const jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
      algorithm: "RS256",
      expiresIn: "2h",
      subject: userId.toString(),
    });
    // res.cookie("SESSIONID", jwtBearerToken, { httpOnly: true, secure: true });
    const hours = 2;
    const hoursToAdd = hours * 60 * 60;
    res.status(200).json({
      idToken: jwtBearerToken,
      expiresIn: hoursToAdd,
    });
    // res
    //   .cookie("SESSIONID", jwtBearerToken, { secure: false })
    //   .status(200)
    //   .json({
    //     success: true,
    //   });

    // send the JWT back to the user
    // TODO - multiple options available
  } else {
    // send status 401 Unauthorized
    res.sendStatus(401);
  }
}

export function stats(req: Request, res: Response) {
  res.send(["Flower", "Candy", "Star", "You"]);
}

app.listen(4000, "0.0.0.0", () => {
  console.log("Server Successfully started");
});
