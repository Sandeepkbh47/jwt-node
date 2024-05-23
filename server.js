"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stats = exports.loginRoute = void 0;
var jwt = require("jsonwebtoken");
var express = require("express");
var expressjwt = require("express-jwt").expressjwt;
var jwksRsa = require("jwks-rsa");
var cors = require("cors");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var fs = require("fs");
var dboper_1 = require("./dboper");
var app = express();
var corsOptions = {
    origin: "http://localhost:4200",
    credentials: true,
    optionsSuccessStatus: 200,
};
var RSA_PRIVATE_KEY = fs.readFileSync("./system/privateKey.key");
var RSA_PUBLIC_KEY = fs.readFileSync("./system/publicKey.key");
var checkIfAuthenticated = expressjwt({
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
    }
    else {
        next(err);
    }
});
function loginRoute(req, res) {
    var email = req.body.email, password = req.body.password;
    if ((0, dboper_1.validateEmailAndPassword)()) {
        var userId = (0, dboper_1.findUserIdForEmail)(email);
        var jwtBearerToken = jwt.sign({}, RSA_PRIVATE_KEY, {
            algorithm: "RS256",
            expiresIn: "2h",
            subject: userId.toString(),
        });
        // res.cookie("SESSIONID", jwtBearerToken, { httpOnly: true, secure: true });
        var hours = 2;
        var hoursToAdd = hours * 60 * 60;
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
    }
    else {
        // send status 401 Unauthorized
        res.sendStatus(401);
    }
}
exports.loginRoute = loginRoute;
function stats(req, res) {
    res.send(["Flower", "Candy", "Star", "You"]);
}
exports.stats = stats;
app.listen(4000, "0.0.0.0", function () {
    console.log("Server Successfully started");
});
