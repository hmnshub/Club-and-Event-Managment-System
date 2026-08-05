// Vercel only auto-detects Serverless Functions under a top-level /api
// directory, but the actual Express app (and its dependency on
// backend/src/*) lives at backend/api/index.js so it can be run directly
// with `node` for local dev too. This just delegates to it — the real app
// stays defined in exactly one place.
module.exports = async (req, res) => {
  const { default: app } = await import('../backend/api/index.js');
  return app(req, res);
};
