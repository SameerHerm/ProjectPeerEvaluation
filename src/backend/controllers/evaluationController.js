// Evaluation endpoints controller (stubs for now)
exports.sendEvaluations = async (req, res, next) => {
  const err = new Error('Send evaluations not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.evaluationStatus = async (req, res, next) => {
  const err = new Error('Evaluation status not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.remindEvaluations = async (req, res, next) => {
  const err = new Error('Remind evaluations not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.getEvaluationForm = async (req, res, next) => {
  const err = new Error('Get evaluation form not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.submitEvaluation = async (req, res, next) => {
  const err = new Error('Submit evaluation not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};

exports.evaluationTokenStatus = async (req, res, next) => {
  const err = new Error('Evaluation token status not implemented.');
  err.code = 'NOT_IMPLEMENTED';
  err.status = 501;
  next(err);
};