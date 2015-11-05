import fs from 'fs';

module.exports = filePath => {
  try {
    fs.statSync(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
  }
  return true;
};
