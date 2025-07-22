#!/usr/bin/env node

import bin from "./index";
import build from "./build";

switch(process.env["NODE_ENV"]) {
case "dev":
case "development":
    break;

default:
    console.debug = () => {};
}

const args = process.argv;
console.debug("Raw Args:", args);
if(args.length >= 2) {
    args.shift();
    args.shift();
}
console.debug("Args:", args);

let exitCode: number = 0;

bin.run(args).catch(async err => {
    console.debug(`Cannot install Changelog: ${err}`);

    let installed: boolean;
    try {
        await build(bin.path());
        installed = true;
    } catch(err) {
        console.error("Cannot build Changelog");
        installed = false;
    }

    if(installed) {
        try {
            await bin.run(args);
        } catch(err) {
            exitCode = 1;
        }
    } else {
        exitCode = 1;
    }
}).finally(() => {
    process.exit(exitCode);
});
