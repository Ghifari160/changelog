import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { execa } from "execa";

import bin from "./index";
import { downloadAndExtract } from "./download";
import info, { sourceURL } from "./info";
import { tempDirectoryTask } from "./temp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, "..");

const log = fs.createWriteStream("install.log");
log.write("Installing Changelog\n");

let exitCode: number = 0;

bin.run("version").then(() => {
    log.write(`Changelog installed to ${bin.path()}\n`);
    console.log(`Changelog installed to ${bin.path()}`);

    log.write("Downloaded sources:");
    bin.downloadedSrc().forEach(src => {
        log.write(`    ${src}\n`);
    });
}).catch(async err => {
    log.write(`Cannot install Changelog ${err}\n`);
    console.error(`Cannot install Changelog: ${err}`);

    await execa("go", ["version"]).catch(err => {
        log.write(`Cannot execute Go: ${err}`);
        log.write("Cannot build Changelog from source");
        console.error(`Cannot execute Go: ${err}`);
        console.error("Cannot build Changelog from source");

        exitCode = 1;
    }).then(async () => {
        const goMod = await fs.promises.stat(path.join(baseDir, "go.mod"))

        if(process.env["NODE_ENV"] !== "production" && goMod.isFile()) {
            log.write("Building Changelog from local source\n");
            console.log("Building Changelog from local source");

            await execa("go", [
                "build",
                "-o", path.join("changelog", "bin", "changelog"),
                "."
            ], { cwd: baseDir }).catch(err => {
                log.write(`Cannot build from source: ${err}`);
                console.error(`Cannot build from source: ${err}`);

                exitCode = 1;
            });

            log.write(`Changelog installed to ${bin.path()}\n`);
            console.log(`Changelog installed to ${bin.path()}`);
        } else {
            log.write("Building Changelog from source\n");
            console.log("Building Changelog from source");

            const download = (url: string, dest: string, ref?: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                    downloadAndExtract(url, dest).catch(err => {
                        log.write(`Failed downloading from ${url}\n`);
                        console.error(`Failed downloading from ${url}`);
                        reject(err);
                    })
                    .finally(() => {
                        resolve(ref || info.version);
                    });
                })
            };

            try {
                await tempDirectoryTask(async temp => {
                    const ref = await Promise.any([
                        download(sourceURL(), temp),
                        download(sourceURL("heads", "main"), temp, "main"),
                    ]);

                    await execa("go", [
                        "build",
                        "-o", path.join(baseDir, "changelog", "bin", "changelog"),
                        "."
                    ], { cwd: path.join(temp, `changelog-${ref}`) });

                    log.write(`Changelog installed to ${bin.path()}\n`);
                    console.log(`Changelog installed to ${bin.path()}`);
                });
            } catch(err) {
                log.write(`Cannot build from source archive: ${err}\n`);
                console.error(`Cannot build from source archive: ${err}`);

                exitCode = 1;
            }
        }
    });
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
