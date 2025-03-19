import * as path from "path";

import * as tar from "tar";

export async function extract(filepath: string, dest: string, format: "tar"): Promise<void> {
    switch(format) {
        case "tar":
            return extractTar(filepath, dest);

        default:
            throw new Error(`Unsupported file type: ${path.extname(filepath)}`);
    }
}

async function extractTar(filepath: string, dest: string): Promise<void> {
    return tar.extract({
        file: filepath,
        cwd: dest,
    });
}
