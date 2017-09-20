exports.activeUrl = function (req, res, next) {
  res.locals.activeNav = function (nav) {
    let result = '';
    let _path = req.path;
    if (nav == _path) {
      result = 'active';
    } else {
      result = '';
    }
    return result;
  };
  next();
};