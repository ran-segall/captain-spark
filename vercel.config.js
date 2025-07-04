/** @type {import('@vercel/client').VercelConfig} */
module.exports = {
    rewrites: async () => [
      { source: '/(.*)', destination: '/' },
    ],
  };
  