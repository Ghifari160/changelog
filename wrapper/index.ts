import path from "path";

import { downloadURL } from "./info";
import BinWrapper from "./wrapper";

const __dirname = import.meta.dirname;

const changelog = new BinWrapper()
    .dest(path.join(__dirname, "..", "vendor", "changelog"))
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

export default changelog;
