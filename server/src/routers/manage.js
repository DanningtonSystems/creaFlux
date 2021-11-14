const express = require("express");
const path = require("path");
const sub = express.Router();
const variableEntry = require(path.join(process.confDir + "/variable/.deploy.js"));

sub.use("/scripts", express.static(path.join(process.confDir, "/scripts")));

if (variableEntry.variableRouter) sub.use("/variable", variableEntry.variableRouter);

sub.get("/deploy", (req, res, next) => {
    res.status(200).send(variableEntry.entrypoint(req, res));
});

module.exports = sub;