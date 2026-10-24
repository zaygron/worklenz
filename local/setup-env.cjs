const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const target = path.join(root, '.env.local');
if (fs.existsSync(target)) {
  console.log('Existing local configuration preserved.');
  process.exit(0);
}
const secret = () => randomBytes(32).toString('hex');
const env = {
  NODE_ENV: 'development',
  PORT: '3000',
  WORKLENZ_DEPLOYMENT_MODE: 'self_hosted',
  HOSTNAME: 'localhost:8082',
  FRONTEND_URL: 'http://localhost:8082',
  APP_URL: 'http://localhost:8082',
  SERVER_CORS: 'http://localhost:8082,http://localhost:8083',
  SOCKET_IO_CORS: 'http://localhost:8082,http://localhost:8083',
  CLIENT_PORTAL_ALLOWED_ORIGINS: 'http://localhost:8083',
  CLIENT_PORTAL_HOSTNAME: 'localhost:8083',
  VITE_API_URL: 'http://localhost:8082',
  VITE_SOCKET_URL: 'ws://localhost:8082',
  VITE_CLIENT_PORTAL_URL: 'http://localhost:8083',
  VITE_APP_VERSION: '697aec19-local',
  SESSION_NAME: 'worklenz.local.sid',
  SESSION_SECRET: secret(),
  COOKIE_SECRET: secret(),
  JWT_SECRET: secret(),
  DB_USER: 'postgres',
  DB_PASSWORD: secret(),
  DB_NAME: 'worklenz_db',
  DB_HOST: 'db',
  DB_PORT: '5432',
  DB_MAX_CLIENTS: '25',
  USE_PG_NATIVE: 'false',
  STORAGE_PROVIDER: 's3',
  S3_ENDPOINT: 'http://seaweedfs:8333',
  S3_PUBLIC_URL: 'http://localhost:8334/worklenz-bucket',
  S3_REGION: 'us-east-1',
  S3_BUCKET: 'worklenz-bucket',
  S3_ACCESS_KEY_ID: 'worklenz-local',
  S3_SECRET_ACCESS_KEY: secret(),
  AWS_REGION: 'us-east-1',
  GOOGLE_CLIENT_ID: 'disabled',
  GOOGLE_CLIENT_SECRET: 'disabled',
  GOOGLE_CALLBACK_URL: 'http://localhost:8082/secure/google/verify',
  LOGIN_FAILURE_REDIRECT: 'http://localhost:8082/auth/authenticating',
  LOGIN_SUCCESS_REDIRECT: 'http://localhost:8082/auth/authenticating',
  EMAIL_PROVIDER: 'smtp',
  EMAIL_FROM: '"Worklenz Local <noreply@worklenz.local>"',
  SMTP_HOST: 'mailpit',
  SMTP_PORT: '1025',
  SMTP_SECURE: 'false',
  SMTP_USER: 'local',
  SMTP_PASSWORD: 'local-only',
  ENABLE_EMAIL_CRONJOBS: 'false',
  ENABLE_RECURRING_JOBS: 'true',
  ENABLE_SLACK_NOTIFICATIONS: 'false',
  GITHUB_WEBHOOK_WORKER_ENABLED: 'false',
  TZ: 'America/Sao_Paulo',
};
fs.writeFileSync(target, Object.entries(env).map(([key, value]) => key + '=' + value).join('\n') + '\n', { flag: 'wx', mode: 0o600 });
console.log('Local configuration generated with independent secrets.');
