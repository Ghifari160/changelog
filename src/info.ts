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
    }
}

function getPackage(dir: string = path.join(__dirname, "..")): Package {
    const data = fs.readFileSync(path.join(dir, "package.json"), "utf8");

    return JSON.parse(data);
}

const info = getPackage();
export default info;

export function downloadURL(os: Platform, arch: Arch): string {
    return info.binary.url
        .replaceAll(/__VERSION__/g, info.version)
        .replaceAll(/__PLATFORM__/g, osArchPair(os, arch));
}
