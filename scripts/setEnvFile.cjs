const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const formattedDate = new Date().getTime();

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

const buildType = process.argv[2] || 'Beta';

let data =
  `BUILD_TYPE=${buildType}` +
  os.EOL +
  `GIT_HASH=${commitHash}` +
  os.EOL +
  `RELEASE_DATE=${formattedDate}`;

fs.writeFile(path.join(__dirname, '..', '.env'), data, 'utf8', err => {
  if (err) {
    console.log(err);
  }
});
