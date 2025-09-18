function Logger() {
  const env = import.meta.env.MODE || 'development';
  switch (env) {
  case 'production':
    return {
      debug: () => {},
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  case 'development':
  default:
    return {
      debug: console.debug,
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
    };
  }
}

const logger = Logger()
export default logger;
