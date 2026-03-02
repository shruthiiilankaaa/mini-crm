
const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = async (req, res, next) => {
  const header = req.header('Authorization');
  if (!header) return res.status(401).json({msg:'No token, authorization denied'});
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this');
    req.user = decoded;
    req.currentUser = await User.findById(req.user.id).select('-passwordHash');
    next();
  } catch (err) {
    return res.status(401).json({msg:'Token invalid'});
  }
};
