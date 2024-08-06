const setEnv = () => {
  const fs = require('fs');
  const writeFile = fs.writeFile;
// Configure Angular `environment.ts` file path
  const targetPath = './src/environments/environment.ts';
// Load node modules
  const colors = require('colors');
  const appVersion = require('../../package.json').version;
  require('dotenv').config({
    path: 'src/environments/.env'
  });
// `environment.ts` file structure
  const envConfigFile = `export const environment = {
  jira_cloud_clientId: '${process.env["JIRA_CLOUD_CLIENT_ID"]}',
  jira_cloud_clientSecret: '${process.env["JIRA_CLOUD_CLIENT_SECRET"]}',
  jira_cloud_callback_url: '${process.env["JIRA_CLOUD_CALLBACK_URL"]}',
  appVersion: '${appVersion}',
  production: ${process.env["PRODUCTION"]??false},
};
`;
  console.log(colors.magenta('The file `environment.ts` will be written with the following content: \n'));
  writeFile(targetPath, envConfigFile, (err: any) => {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(colors.magenta(`Angular environment.ts file generated correctly at ${targetPath} \n`));
    }
  });
};

setEnv();
