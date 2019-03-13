# [2.4.0](https://github.com/OmarTawfik/github-actions-js/compare/v2.3.0...v2.4.0) (2019-03-13)


### Features

* provide brace matching ([e83ab47](https://github.com/OmarTawfik/github-actions-js/commit/e83ab47)), closes [#16](https://github.com/OmarTawfik/github-actions-js/issues/16)

# [2.3.0](https://github.com/OmarTawfik/github-actions-js/compare/v2.2.0...v2.3.0) (2019-03-13)


### Features

* added navigation services ([#71](https://github.com/OmarTawfik/github-actions-js/issues/71)) ([b3cde86](https://github.com/OmarTawfik/github-actions-js/commit/b3cde86)), closes [#67](https://github.com/OmarTawfik/github-actions-js/issues/67)

# [2.2.0](https://github.com/OmarTawfik/github-actions-js/compare/v2.1.0...v2.2.0) (2019-03-12)


### Features

* provide rename service ([#63](https://github.com/OmarTawfik/github-actions-js/issues/63)) ([17f8e79](https://github.com/OmarTawfik/github-actions-js/commit/17f8e79)), closes [#21](https://github.com/OmarTawfik/github-actions-js/issues/21)

# [2.1.0](https://github.com/OmarTawfik/github-actions-js/compare/v2.0.2...v2.1.0) (2019-03-12)


### Features

* add semantic folding feature to vscode ([#59](https://github.com/OmarTawfik/github-actions-js/issues/59)) ([9ae8037](https://github.com/OmarTawfik/github-actions-js/commit/9ae8037)), closes [#22](https://github.com/OmarTawfik/github-actions-js/issues/22)

## [2.0.2](https://github.com/OmarTawfik/github-actions-js/compare/v2.0.1...v2.0.2) (2019-03-12)


### Bug Fixes

* install vscode dependencies before publishing ([#57](https://github.com/OmarTawfik/github-actions-js/issues/57)) ([f144021](https://github.com/OmarTawfik/github-actions-js/commit/f144021))
* remove scripts from vscode extension before publishing ([#58](https://github.com/OmarTawfik/github-actions-js/issues/58)) ([652f365](https://github.com/OmarTawfik/github-actions-js/commit/652f365))

## [2.0.1](https://github.com/OmarTawfik/github-actions-js/compare/v2.0.0...v2.0.1) (2019-03-12)


### Bug Fixes

* vsce deployment root path ([#56](https://github.com/OmarTawfik/github-actions-js/issues/56)) ([f82e5cb](https://github.com/OmarTawfik/github-actions-js/commit/f82e5cb))

# [2.0.0](https://github.com/OmarTawfik/github-actions-js/compare/v1.4.0...v2.0.0) (2019-03-12)


### Bug Fixes

* vsce deployment script ([#55](https://github.com/OmarTawfik/github-actions-js/issues/55)) ([0ecec1f](https://github.com/OmarTawfik/github-actions-js/commit/0ecec1f))


### BREAKING CHANGES

* added all missing diagnostics from v1

# [1.4.0](https://github.com/OmarTawfik/github-actions-js/compare/v1.3.0...v1.4.0) (2019-03-12)


### Features

* publish vscode extension ([#52](https://github.com/OmarTawfik/github-actions-js/issues/52)) ([b28f5e7](https://github.com/OmarTawfik/github-actions-js/commit/b28f5e7))

# [1.3.0](https://github.com/OmarTawfik/github-actions-js/compare/v1.2.1...v1.3.0) (2019-03-12)


### Bug Fixes

* report errors on duplicate actions or workflows ([#44](https://github.com/OmarTawfik/github-actions-js/issues/44)) ([5572f59](https://github.com/OmarTawfik/github-actions-js/commit/5572f59)), closes [#41](https://github.com/OmarTawfik/github-actions-js/issues/41)


### Features

* report error when 'needs' refers to a non-existing action ([#46](https://github.com/OmarTawfik/github-actions-js/issues/46)) ([cc446d6](https://github.com/OmarTawfik/github-actions-js/commit/cc446d6)), closes [#7](https://github.com/OmarTawfik/github-actions-js/issues/7)
* report errors on actions circular dependencies ([#47](https://github.com/OmarTawfik/github-actions-js/issues/47)) ([87ea513](https://github.com/OmarTawfik/github-actions-js/commit/87ea513)), closes [#11](https://github.com/OmarTawfik/github-actions-js/issues/11)
* report errors on duplicate actions in resolves ([#48](https://github.com/OmarTawfik/github-actions-js/issues/48)) ([5e7db6d](https://github.com/OmarTawfik/github-actions-js/commit/5e7db6d)), closes [#37](https://github.com/OmarTawfik/github-actions-js/issues/37)
* report errors on duplicate needs actions ([#49](https://github.com/OmarTawfik/github-actions-js/issues/49)) ([1e0fc49](https://github.com/OmarTawfik/github-actions-js/commit/1e0fc49)), closes [#42](https://github.com/OmarTawfik/github-actions-js/issues/42)
* report errors on duplicate or too many actions ([#33](https://github.com/OmarTawfik/github-actions-js/issues/33)) ([f32daa3](https://github.com/OmarTawfik/github-actions-js/commit/f32daa3)), closes [#10](https://github.com/OmarTawfik/github-actions-js/issues/10)
* report errors on invalid 'uses' values ([#50](https://github.com/OmarTawfik/github-actions-js/issues/50)) ([2cc08f5](https://github.com/OmarTawfik/github-actions-js/commit/2cc08f5)), closes [#6](https://github.com/OmarTawfik/github-actions-js/issues/6)
* report errors on reserved environment variables ([#34](https://github.com/OmarTawfik/github-actions-js/issues/34)) ([73ba6aa](https://github.com/OmarTawfik/github-actions-js/commit/73ba6aa))
* report errors on unknown event types ([#45](https://github.com/OmarTawfik/github-actions-js/issues/45)) ([7b3720b](https://github.com/OmarTawfik/github-actions-js/commit/7b3720b)), closes [#4](https://github.com/OmarTawfik/github-actions-js/issues/4)
* report errors on unresolved actions ([#38](https://github.com/OmarTawfik/github-actions-js/issues/38)) ([61a2eec](https://github.com/OmarTawfik/github-actions-js/commit/61a2eec))

## [1.2.1](https://github.com/OmarTawfik/github-actions-js/compare/v1.2.0...v1.2.1) (2019-03-07)


### Bug Fixes

* fix npm postinstall script ([#32](https://github.com/OmarTawfik/github-actions-js/issues/32)) ([c9a1e00](https://github.com/OmarTawfik/github-actions-js/commit/c9a1e00))

# [1.2.0](https://github.com/OmarTawfik/github-actions-js/compare/v1.1.0...v1.2.0) (2019-03-07)


### Features

* reports errors on duplicate secrets ([#31](https://github.com/OmarTawfik/github-actions-js/issues/31)) ([32ebb36](https://github.com/OmarTawfik/github-actions-js/commit/32ebb36)), closes [#12](https://github.com/OmarTawfik/github-actions-js/issues/12)

# [1.1.0](https://github.com/OmarTawfik/github-actions-js/compare/v1.0.0...v1.1.0) (2019-03-07)


### Features

* report errors on too many secrets ([#27](https://github.com/OmarTawfik/github-actions-js/issues/27)) ([8ece721](https://github.com/OmarTawfik/github-actions-js/commit/8ece721)), closes [#9](https://github.com/OmarTawfik/github-actions-js/issues/9)

# 1.0.0 (2019-03-06)


### Features

* added binder ([#13](https://github.com/OmarTawfik/github-actions-js/issues/13)) ([16bf355](https://github.com/OmarTawfik/github-actions-js/commit/16bf355))
* added LSP + diagnostics service ([#23](https://github.com/OmarTawfik/github-actions-js/issues/23)) ([13bbf97](https://github.com/OmarTawfik/github-actions-js/commit/13bbf97))
* added parser ([#2](https://github.com/OmarTawfik/github-actions-js/issues/2)) ([b750f26](https://github.com/OmarTawfik/github-actions-js/commit/b750f26))
* added scanner + test ([#1](https://github.com/OmarTawfik/github-actions-js/issues/1)) ([20726c0](https://github.com/OmarTawfik/github-actions-js/commit/20726c0))
* added tsc, tslint, prettier, and a test source file ([4b92be1](https://github.com/OmarTawfik/github-actions-js/commit/4b92be1))
* added vscode extension with highlighting and snippets ([#15](https://github.com/OmarTawfik/github-actions-js/issues/15)) ([8112d1d](https://github.com/OmarTawfik/github-actions-js/commit/8112d1d))
