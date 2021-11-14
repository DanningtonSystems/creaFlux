const express = require("express");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");
const app = express();

const port = process.env.CREAFLUX_PORT || 55895;
const listener = process.env.CREAFLUX_LISTENER || "0.0.0.0";
const confPath = process.env.CREAFLUX_CONF_PATH || path.join(__dirname + "/../.confData/core.config.json");

if (!fs.existsSync(path.dirname(confPath))) {
    fs.mkdirSync(path.dirname(confPath));
} if (!fs.existsSync(confPath)) {
    const genID = nanoid(64);
    fs.writeFileSync(confPath, JSON.stringify({
        "port": port,
        "listener": listener,
        "auth": {
            "enabled": true,
            "secret": genID
        },
        "confDir": path.dirname(confPath),
        "variable": {
            deployEntrypoint: ".deploy.js"
        }
    }, null, 2));

    console.log(chalk.yellowBright(`A new creaFlux key was generated (${chalk.bold(genID)}).\nSuffix all requests to the API with ${chalk.bold(`?serverSecret=${genID}`)}.\nYou can find the configuration file at the following path: ${chalk.bold(confPath)}.`));
} if (!fs.existsSync(path.join(path.dirname(confPath) + "/scripts/"))) {
    fs.mkdirSync(path.join(path.dirname(confPath) + "/scripts/"));
} if (!fs.existsSync(path.join(path.dirname(confPath) + "/variable"))) {
    fs.mkdirSync(path.join(path.dirname(confPath) + "/variable"));
} if (!fs.existsSync(path.join(path.dirname(confPath) + "/variable/.deploy.js"))) {
    fs.writeFileSync(path.join(path.dirname(confPath) + "/variable/.deploy.js"), fs.readFileSync(path.dirname(confPath) + "/example/example.deploy.js", "utf8"));
};

const conf = require(confPath);
process.confDir = conf.confDir;
process.conf = conf;

const ManageModule = require("./routers/manage");

app.get("/", function (req, res, next) {
    res.status(200).send({
        status: 200,
        response: {
            default: "creaFlux responded with \"200 OK\".",
            information: "https://github.com/DanningtonSystems/creaFlux"
        }
    })
});

app.use("/manage", (req, res, next) => {
    req.config = conf;
    if (!req.query.serverSecret) {
        return res.status(401).send({
            status: 401,
            response: {
                default: "creaFlux responded with \"401 Unauthorized\".",
                information: "You must provide a serverSecret query to access the API."
            }
        });
    } else if (req.query.serverSecret !== conf.auth.secret) {
        return res.status(401).send({
            status: 401,
            response: {
                default: "creaFlux responded with \"401 Unauthorized\".",
                information: "The server secret provided in the request did not match the secret configured for this instance of creaFlux Server."
            }
        });
    };

    next();
}, ManageModule);


app.use(function (req, res, next) {
    res.status(404).send({
        status: 404,
        response: {
            default: "creaFlux responded with \"404 Not Found\".",
            information: "The requested resource was not found."
        }
    });
});

app.listen(port, function () {
    console.log(chalk.blue(`${chalk.bold("creaFlux Server")} ${new Date().toUTCString()} || Server is now listening on port ${port}`));
});