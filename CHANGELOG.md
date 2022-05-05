# Changelog

## 1.8.0

- Update npm packages to fix security vulnerabilities in dependencies.
## 1.7.5

### Fixed

- Fix security alerts (updated npm packages)

## 1.7.4

### Fixed

- Fix Sling-Initial-Content XML content (serialization format: slingxml)

## 1.7.3

### Fixed

- Filter out duplicated entry files #30

## 1.7.2

### Added

- Add 'replaces' property to 'clientLibDirectoryFields'. It defines the path to the library that is replaced by 'this' one.
- Add 'disableIfReplacing' property to 'clientLibDirectoryFields'. It disables this library if it would replace the old one.

## 1.7.1

- add travis ci

## 1.7.0

### Update

- update minimum required node version to be >=10.19.0

## 1.6.0

### Fixed

- update packages to resolve securitiy warnings

### Added

- add _serializationFormat_ 'slingxml' which can be used for XML outputs for Sling Initial Content

## 1.5.0

### Added

- add ability to use a ignore pattern to exclude assets

## 1.4.4

### Fixed

- update packages to resolve security warnings

### Added

- Add ability to create directories recursively

## 1.4.3

### Added

- add package-lock.json to make use of the npm command "npm ci" for ci builds

## 1.4.2

### Fixed

- Fix security alerts by updating the dependencies.

## 1.4.1

### Added

- support for _serializationFormat_ in clientLibs configuration to enable FileVault XML or JSON (default) output format

## 1.3.0

### Added

- `categories` can be set in config to override name as category value

## 1.2.4

### Fixed

- added missing dependency `yargs`

## 1.2.3

### Fixed

- issue with clientlibs using relative path delimiters under windows

## 1.2.2

### Added

- support for _allowProxy_ in clientLibs configuration (optional in AEM 6.3)
- support for _longCacheKey_ in clientLibs configuration (optional)

## 1.2.1

### Fixed

- missing glob version

## 1.2.0

### Added

- clientlib CLI with new configuration file `clientlib.config.js`
- options verbose and dry
- add glob feature

## 1.1.0

### Added

- properties _cssProcessor_ and _jsProcessor_ to configure the minification tool to be used for the ClientLib
  (needs AEM 6.2)

## 1.0.1

### Fixed

- file entries in clientlib configuration `js.txt` and `css.txt` will only be added with file extension ".js" or ".css"
  (source maps can be included now)
- fix example

## 1.0.0

- Initial release
