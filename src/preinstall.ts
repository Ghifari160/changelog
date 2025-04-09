import fs from "fs";

import bin from "./index";

const log = fs.createWriteStream("install.log");
log.write("Installing Changelog\n");

let exitCode: number = 0;

bin.ensureExist().then(() => {
    log.write(`Changelog installed to ${bin.path()}\n`);
    console.log(`Changelog installed to ${bin.path()}`);

    log.write("Downloaded sources:");
    bin.downloadedSrc().forEach(src => {
        log.write(`    ${src}\n`);
    });
}).catch(err => {
    log.write(`Cannot install Changelog ${err}\n`);
    console.error(`Cannot install Changelog`, err);

    exitCode = 1;
}).finally(() => {
    log.write("\n");
    log.write(`cwd: ${process.cwd()}\n`);
    log.write(`dest: ${bin.dest()}\n`);
    log.write(`use: ${bin.use()}\n`);

    log.close(err => {
        if(err) {
            console.error(err);
            exitCode = -1;
        }

        process.exit(exitCode);
    });
});
