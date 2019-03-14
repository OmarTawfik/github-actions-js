# GitHubActions.js [![CircleCI](https://circleci.com/gh/OmarTawfik/github-actions-js.png?style=svg)](https://circleci.com/gh/OmarTawfik/github-actions-js)

Provides linting APIs on the command line, through Node.js, and rich code editing through VSCode.

### Using the NPM Package

> https://www.npmjs.com/package/github-actions-linter

Add the package through npm/yarn:

```bash
$ npm i github-actions-linter
$ yarn add github-actions-linter
```

Run linter through Node.js:

```ts
import { lint } from "github-actions-linter";

const diagnostics = lint(code);
console.log(diagnostics.length + " errors were found.");

diagnostics.forEach(diagnostic => {
  console.log(diagnostic.message);
});
```

Or invoke through the CLI:

```bash
$ github-actions-linter file1.workflow file2.workflow
```

It will exit cleanly if no errors were found, or with a positive error code (number of errors) if any existed:

![image](https://user-images.githubusercontent.com/15987992/53709938-bedad000-3def-11e9-8cc5-8ab55b1462e2.png)

### Using the VSCode Extension

> https://marketplace.visualstudio.com/items?itemName=OmarTawfik.github-actions-vscode

The VSCode extension provides many features, like inserting code snippets, colorization, formatting, and providing diagnostics as you type.

![image](https://user-images.githubusercontent.com/15987992/54337709-ed755980-45ec-11e9-9920-fd8e854437fb.gif)
