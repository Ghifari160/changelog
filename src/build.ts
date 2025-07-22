import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { execa } from "execa";

import { downloadAndExtract } from "./download";
import info, { sourceURL } from "./info";
import { tempDirectoryTask } from "./temp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, "..");

switch(process.env["NODE_ENV"]) {
case "dev":
case "development":
    break;

default:
    console.debug = () => {};
}

const processEnv = process.env["NODE_ENV"];

async function goExist() {
    try {
        await execa("go", ["version"]);
        return true;
    } catch(err) {
        throw err;
    }
}

async function download(url: string, dest: string, ref?: string) {
    return new Promise((resolve, reject) => {
        downloadAndExtract(url, dest).catch(err => {
            console.debug(`Failed downloading from ${url}`);
            reject(err);
        })
        .finally(() => resolve(ref || info.version));
    });
}

export default async function build(binPath: string) {
    try {
        await goExist();
    } catch(err) {
        console.error(`Cannot execute Go: ${err}`);
        throw err;
    }

    const goMod = await fs.promises.stat(path.join(baseDir, "go.mod"));

    if(processEnv === "dev" || processEnv === "development" && goMod.isFile()) {
        console.debug("Building Changelog from local source");

        try {
            await execa("go", [
                "build",
                "-mod=mod",
                "-o", binPath,
                "."
            ], { cwd: baseDir });
        } catch(err) {
            console.error(`Cannot build from local source: ${err}`);
            throw err;
        }
    } else {
        console.debug("Building Changelog from source");

        try {
            await tempDirectoryTask(async temp => {
                const ref = await Promise.any([
                    download(sourceURL(), temp),
                    download(sourceURL("heads", "main"), temp, "main"),
                ]);

                await execa("go", [
                    "build",
                    "-mod=mod",
                    "-o", path.join(baseDir, binPath),
                    "."
                ], { cwd: path.join(temp, `changelog-${ref}`) });
            });
        } catch(err) {
            console.error(`Cannot build from source: ${err}`);
            throw err;
        }
    }

    console.debug(`Changelog installed to ${binPath}`);
}
