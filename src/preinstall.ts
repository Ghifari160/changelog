import path from "path";
import fs from "fs";

import BinWrapper from "./wrapper";
import { downloadURL } from "./info";

const changelog = new BinWrapper()
    .dest("changelog")
    .use(path.join("bin", process.platform === "win32" ? "changelog.exe" : "changelog"))

    .src(downloadURL("linux", "ia32"), "linux", "ia32")
    .src(downloadURL("linux", "x64"), "linux", "x64")
    .src(downloadURL("linux", "arm"), "linux", "arm")
    .src(downloadURL("linux", "arm64"), "linux", "arm64")

    .src(downloadURL("darwin", "x64"), "darwin", "x64")
    .src(downloadURL("darwin", "arm64"), "darwin", "arm64")

    .src(downloadURL("win32", "ia32"), "win32", "ia32")
    .src(downloadURL("win32", "x64"), "win32", "x64")
    .src(downloadURL("win32", "arm"), "win32", "arm")
    .src(downloadURL("win32", "arm64"), "win32", "arm64")

    .src(downloadURL("freebsd", "ia32"), "freebsd", "ia32")
    .src(downloadURL("freebsd", "x64"), "freebsd", "x64")
    .src(downloadURL("freebsd", "arm"), "freebsd", "arm")
    .src(downloadURL("freebsd", "arm64"), "freebsd", "arm64");

const log = fs.createWriteStream("install.log");
log.write("Installing Changelog\n");

let exitCode: number = 0;

changelog.ensureExist().then(() => {
    log.write(`Changelog installed to ${changelog.path()}\n`);
    console.log(`Changelog installed to ${changelog.path()}`);

    log.write("Downloaded sources:");
    changelog.downloadedSrc().forEach(src => {
        log.write(`    ${src}\n`);
    });
}).catch(err => {
    log.write(`Cannot install Changelog ${err}\n`);
    console.error(`Cannot install Changelog`, err);

    exitCode = 1;
}).finally(() => {
    log.write("\n");
    log.write(`cwd: ${process.cwd()}\n`);
    log.write(`dest: ${changelog.dest()}\n`);
    log.write(`use: ${changelog.use()}\n`);

    log.close(err => {
        if(err) {
            console.error(err);
            exitCode = -1;
        }

        process.exit(exitCode);
    });
});
