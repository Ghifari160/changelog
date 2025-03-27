export type Platform = typeof process.platform;
export type Arch = typeof process.arch;

export function osArchPair(os: Platform = process.platform, arch: Arch = process.arch): string {
    return `${normalizeOS(os)}_${normalizeArch(arch)}`;
}

function normalizeOS(os: Platform = process.platform): string {
    switch(os) {
        case "win32":
            return "windows";

        case "aix":
        case "android":
        case "darwin":
        case "freebsd":
        case "haiku":
        case "linux":
        case "openbsd":
        case "sunos":
        case "cygwin":
        case "netbsd":
            return os;
    }
}

function normalizeArch(arch: Arch = process.arch): string {
    switch(arch) {
        case "ia32":
            return "386";

        case "x64":
            return "amd64";

        case "arm":
        case "arm64":
        case "loong64":
        case "mips":
        case "mipsel":
        case "ppc":
        case "ppc64":
        case "riscv64":
        case "s390":
        case "s390x":
        default:
            return arch;
    }
}
