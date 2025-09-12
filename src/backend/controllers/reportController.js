// Reporting endpoints controller (stubs for now)
exports.getCourseReport = async (req, res, next) => {
  const err = new Error('Get course report not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.downloadReport = async (req, res, next) => {
  const err = new Error('Download report not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.getStudentReport = async (req, res, next) => {
  const err = new Error('Get student report not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.getTeamReport = async (req, res, next) => {
  const err = new Error('Get team report not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.generateReport = async (req, res, next) => {
  const err = new Error('Generate report not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};