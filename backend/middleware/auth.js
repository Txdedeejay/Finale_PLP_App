// Simple development auth middleware - attaches a dummy user id to req.user
module.exports = (req, res, next) => {
  // Use env var if available so behaviour can be consistent across environments
  const devUserId = process.env.DEV_USER_ID || '000000000000000000000000';
  req.user = { _id: devUserId };
  next();
};