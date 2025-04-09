import type { Options, Result } from "execa";
import type { Platform, Arch } from "./platform";

import path from "path";
import fs from "fs";

import { execa } from "execa";

import { downloadAndExtract } from "./download";

interface Source {
    os: Platform,
    arch: Arch,
    url: string,
}

class BinWrapper {
    private readonly sources: Source[];
    private destination: string;
    private binName: string;
    private downloaded: string[];

    constructor() {
        this.sources = [];
        this.destination = "";
        this.binName = "";
        this.downloaded = [];
    }

    src(src: string): this;
    src(src: string, os: Platform): this;
    src(src: string, os: Platform, arch: Arch): this;
    src(src: string, os: Platform = process.platform, arch: Arch = process.arch): this {
        this.sources.push({
            os: os,
            arch: arch,
            url: src,
        });

        return this;
    }

    downloadedSrc(): string[] {
        return this.downloaded;
    }

    dest(): string;
    dest(dest: string): this;
    dest(dest?: string): this | string {
        if(typeof dest === "undefined") {
            return this.destination;
        }

        if(!this.exist(dest)) {
            this.createDir(dest);
        } else if(!this.isDirectory(dest)) {
            throw new Error(`Destination ${dest} is not a directory`);
        }

        this.destination = dest;

        return this;
    }

    use(): string;
    use(binName: string): this;
    use(binName?: string): this | string {
        if(typeof binName === "undefined") {
            return this.binName;
        }

        this.binName = binName;

        return this;
    }

    path(): string {
        return path.join(this.destination, this.binName);
    }

    async run(args: string[]): Promise<Result<Options>>;
    async run(...args: string[]): Promise<Result<Options>>;
    async run(
        args: string[] | string = [ "--version" ],
        ...others: string[]
    ): Promise<Result<Options>> {
        if(Array.isArray(args) && others.length > 0) {
            throw new Error("args must be array or list, not both");
        }

        if(typeof args === "string") {
            args = [args, ...others];
        }

        await this.ensureExist();

        return execa(this.path(), args);
    }

    async ensureExist(): Promise<void> {
        if(fs.existsSync(this.path())) {
            return;
        }

        await this.download();
    }

    private async download(): Promise<void> {
        const srcs = this.getSrcs();

        if(srcs.length < 1) {
            throw new Error(`No binary for ${process.platform}_${process.arch}`);
        }

        await Promise.all(srcs.map(async src => {
            await downloadAndExtract(src.url, this.destination);
            this.downloaded.push(src.url);
        }));
    }

    private getSrcs(): Source[] {
        return this.sources.filter(src => src.os === process.platform && src.arch === process.arch);
    }

    private exist(path: fs.PathLike): boolean {
        return fs.existsSync(path);
    }

    private isDirectory(path: fs.PathLike): boolean {
        return fs.statSync(path).isDirectory();
    }

    private createDir(path: fs.PathLike): void {
        fs.mkdirSync(path, { recursive: true });
    }
}
export default BinWrapper;
