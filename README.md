# GitHubActions.js [![CircleCI](https://circleci.com/gh/OmarTawfik/github-actions-js.svg?style=svg)](https://circleci.com/gh/OmarTawfik/github-actions-js)

This package provides:

- A CLI tool to lint GitHub workflow files.
- A node API to provide lint diagnostics.
- A VSCode extension that supports rich editing and linting as you type.

### Using the CLI package

Add the package through npm/yarn:

```bash
$ npm i github-actions-linter
$ yarn add github-actions-linter
```

And just provide a list of files to lint:

```bash
$ github-actions-linter file1.workflow file2.workflow
```

It will exit cleanly if no errors were found, or with a positive error code (number of errors) if any were found:

![image](https://user-images.githubusercontent.com/15987992/53709938-bedad000-3def-11e9-8cc5-8ab55b1462e2.png)

### Using the API

```ts
import { lint } from "github-actions-linter";

const diagnostics = lint(code);
console.log(diagnostics.length + " errors were found.");

diagnostics.forEach(diagnostic => {
  console.log(diagnostic.message);
});
```
