const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BACKEND_DIR = path.resolve(__dirname, '..');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const buildPath = (maybeRelative) => {
  if (!maybeRelative) {
    return path.resolve(BACKEND_DIR, 'database.sqlite');
  }
  return path.isAbsolute(maybeRelative)
    ? maybeRelative
    : path.resolve(PROJECT_ROOT, maybeRelative);
};

const uploadDir = process.env.UPLOAD_DIR
  ? buildPath(process.env.UPLOAD_DIR)
  : path.resolve(BACKEND_DIR, 'uploads');

module.exports = {
  PORT: Number(process.env.PORT) || 5000,
  SECRET_KEY: process.env.SECRET_KEY || 'change_me',
  DB_PATH: buildPath(process.env.DB_PATH || 'backend/database.sqlite'),
  UPLOAD_DIR: uploadDir,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '*',
  BACKEND_DIR,
};
