<!-- markdownlint-disable MD024 -->

# Changelog

All notable changes in Changelog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project attempts to adhere to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [UNRELEASED]

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

### Changed

### Deprecated

### Removed

### Fixed

### Security
