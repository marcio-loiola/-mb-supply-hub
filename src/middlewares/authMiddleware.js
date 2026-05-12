function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send('No token');
  // Mock JWT decoding
  req.tenant_id = '123';
  next();
}
module.exports = authMiddleware;
