# Contributing Guide

Contributions are welcome and are greatly appreciated!


## Setting up your environment

After forking to your own github org or account, do the following steps to get started:

```bash
# clone your fork to your local machine
git clone https://github.com/<your-account-name>/lnreader.git

# step into local repo
cd lnreader

# install dependencies
npm install

# run metro for development
npm start
```

### Developing on Android

While the packager is running and you have an Android device or emulator connected to your computer, build and launch the Android app.

```
npm run android
```

### Style & Linting

This codebase's linting rules are enforced using [ESLint](http://eslint.org/).

It is recommended that you install an eslint plugin for your editor of choice when working on this
codebase, however you can always check to see if the source code is compliant by running:

```bash
npm run lint
```
