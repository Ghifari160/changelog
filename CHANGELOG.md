<!-- markdownlint-disable MD024 -->

# Changelog

All notable changes in Changelog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project attempts to adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

### Added

### Changed

- When installing from NPM, Changelog precompiled binary is now installed to `vendor/changelog/bin/changelog` (`vendor\changelog\bin\changelog.exe` on Windows).
- When installing from NPM, installation of the Changelog binary is now delayed until first execution.
  This way, we're no longer relying on installation hooks (which can be skipped by the user) to properly install the Changelog binary.
- `get` and `promote` commands now strips leading `v` from version targets.
  Running `changelog get v0.2.0` will match `0.2.0`, and running `changelog promote v0.3.0` will create a version section with `0.3.0` as the heading.

### Deprecated

### Removed

### Fixed

### Security

## [0.2.0] - 2025-04-08

### Changed

- Default export for NodeJS wrapper is now the wrapper object itself.
  See `src/wrapper.ts` for more information.
- NodeJS wrapper pre-installation hook now imports the default export for NodeJS wrapper module.
- When installing on unsupported platforms through NPM, the wrapper will attempt to build from source archive.
  Note: building from source requires [Go](https://go.dev).

### Fixed

- When installing through NPM on Windows, the pre-installation hook now downloads the correct archive.
- NodeJS wrapper no longer prints the path to temporary files when downloading archives.
- Command `prepare` now prints all default and user provided sections to the changelog file.
  Previously, a changelog file without an existing `unreleased` version causes the command to output an empty version.

## [0.1.0] - 2025-03-26

### Added

- Package `markdown`.
  It implements encoding and decoding of data from and to Markdown formatted representation.
- Package `keepachangelog`.
  It implements types and functions to assist in maintaining a Changelog based on the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
- Command `get`, which shows changes for a specific version(s).
- Command `version`, which prints the app version.
- Command `promote`, which promotes unreleased draft to be the next release version.
- Command `prepare`, which prepares the changelog for the next release cycle.
- NodeJS wrapper.
  Changelog can be installed through npm (`npm install @ghifari160/changelog`).
  On supported platforms, the pre-install hook download and install the precompiled binary for that platform.
  It can also be imported as a module, which will return the path to the changelog binary.
  Note: installation will silently fail of installed with `--ignore-scripts`.
