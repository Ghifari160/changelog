import { randomBytes } from "crypto";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import os from "os";

const tempDir = fsSync.realpathSync(os.tmpdir());

function getPath(prefix: string = ""): string {
    return path.join(tempDir, `${prefix}${randomString()}`);
}

function randomString(len: number = 32): string {
    return randomBytes(len/2).toString("hex");
}

async function runTask(tempPath: string, cb: (tempPath: string) => Promise<void>): Promise<void> {
    try {
        return await cb(tempPath);
    } finally {
        await fs.rm(tempPath, { recursive: true, force: true, maxRetries: 5 });
    }
}

export function tempFile({
    name,
    extension,
}: {
    name?: string,
    extension?: string,
} = {}): string {
    if(name) {
        if(typeof extension !== "undefined" && extension !== null) {
            throw new Error("name and extension are mutually exclusive!");
        }

        return path.join(tempDir, name);
    }

    return getPath() +
        ((extension === undefined || extension === null) ? "" : `.${extension?.replace(/^\./, "")}`);
}

export async function tempFileTask(
    cb: (tempPath: string) => Promise<void>,
    options?: {
        name?: string,
        extension?: string,
}): Promise<void> {
    return runTask(tempFile(options), cb);
}

export function tempDirectory({
    prefix,
}: {
    prefix?: string,
} = {}): string {
    const dir = getPath(prefix);

    fsSync.mkdirSync(dir);

    return dir;
}

export async function tempDirectoryTask(
    cb: (tempPath: string) => Promise<void>,
    options?: {
        prefix?: string,
    },
): Promise<void> {
    return runTask(tempDirectory(options), cb);
}
