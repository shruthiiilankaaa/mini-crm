
module.exports = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if (!req.currentUser) return res.status(403).json({msg:'No user found'});
    if (roles.length && !roles.includes(req.currentUser.role)) {
      return res.status(403).json({msg:'Forbidden: insufficient role'});
    }
    next();
  };
};
