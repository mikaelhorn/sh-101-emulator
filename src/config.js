const config = {
  env: {
    NODE_ENV: 'development'
  }
};

if (typeof window !== 'undefined') {
  window.process = window.process || { env: config.env };
}

export default config;