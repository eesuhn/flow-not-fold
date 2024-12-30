export const logWarning = (message: string) => {
  console.warn('\x1b[33m%s\x1b[0m', message);
};

export const logInfo = (message: string) => {
  console.log('\x1b[36m%s\x1b[0m', message);
};

export const logSuccess = (message: string) => {
  console.log('\x1b[32m%s\x1b[0m', message);
};

export const logError = (message: string) => {
  console.error('\x1b[31m%s\x1b[0m', message);
};
