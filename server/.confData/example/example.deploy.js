const express = require("express");
const deployRouter = express.Router();
const fetch = require("node-fetch");

deployRouter.get("/example", (req, res, next) => {
    res.send("Example deployment script router path, accessible at /manage/variable/example");
});

module.exports = {
    entrypoint: function (req, res) {
        return "Example deployment script, accessible at /manage/deploy";
    },
    variableRouter: deployRouter
}