import type { Arch, Platform } from "./platform";

import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

import { osArchPair } from "./platform";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

interface Package {
    name: string,
    version: string,
    description: string,
    binary: {
        url: string,
        src: string,
    },
    repository: {
        type: "git",
        url: string,
    },
}

function getPackage(dir: string = path.join(__dirname, "..")): Package {
    const data = fs.readFileSync(path.join(dir, "package.json"), "utf8");

    return JSON.parse(data);
}

const info = getPackage();
export default info;

export function downloadURL(os: Platform, arch: Arch): string {
    return fillVars(info.binary.url, os, arch);
}

export function sourceURL(refs?: string, ref?: string): string {
    return fillVars(info.binary.src, undefined, undefined, refs, ref);
}

function fillVars(str: string, os?: Platform, arch?: Arch, refs: string = "tags", ref?: string): string {
    return str
        .replaceAll(/__VERSION__/g, info.version)
        .replaceAll(/__PLATFORM__/g, osArchPair(os || process.platform, arch || process.arch))
        .replaceAll(/__REFS__/g, refs)
        .replaceAll(/__REF__/g, ref || info.version);
}
