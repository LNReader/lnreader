const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync } = require('child_process');

const formattedDate = new Date().getTime();
const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const buildType = process.argv[2] || 'Beta';

const newEnvVars = [
  `BUILD_TYPE=${buildType}`,
  `GIT_HASH=${commitHash}`,
  `RELEASE_DATE=${formattedDate}`,
  `NODE_ENV=${buildType === 'Release' ? 'production' : 'development'}`,
].join(os.EOL);

const envFilePath = path.join(__dirname, '..', '.env');
let existingEnvData = '';

try {
  if (fs.existsSync(envFilePath)) {
    const existingContent = fs.readFileSync(envFilePath, 'utf8');

    existingEnvData = existingContent
      .split(os.EOL)
      .filter(line => {
        const trimmedLine = line.trim();
        return (
          trimmedLine &&
          !trimmedLine.startsWith('BUILD_TYPE=') &&
          !trimmedLine.startsWith('GIT_HASH=') &&
          !trimmedLine.startsWith('RELEASE_DATE=') &&
          !trimmedLine.startsWith('NODE_ENV=')
        );
      })
      .join(os.EOL);
  }
} catch (err) {
  console.warn('Warning: Could not read existing .env file:', err.message);
}

const finalContent = existingEnvData
  ? `${newEnvVars}${os.EOL}${existingEnvData}${os.EOL}`
  : `${newEnvVars}${os.EOL}`;

try {
  fs.writeFileSync(envFilePath, finalContent, 'utf8');

  console.log(`Generated .env file for ${buildType} build\n`);
  console.table({
    BUILD_TYPE: buildType,
    GIT_HASH: commitHash,
    RELEASE_DATE: formattedDate,
    NODE_ENV: buildType === 'Release' ? 'production' : 'development',
  });
  console.log('\n');
} catch (err) {
  console.error('Error: Could not write .env file:', err.message);
  process.exit(1);
}
