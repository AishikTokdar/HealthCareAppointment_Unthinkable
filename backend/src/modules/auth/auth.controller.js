const authService = require('./auth.service');

async function handleRegisterPatient(req, res, next) {
  try {
    const result = await authService.registerPatient(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleRegisterDoctor(req, res, next) {
  try {
    const result = await authService.registerDoctor(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function handleLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function handleGetMe(req, res, next) {
  try {
    const result = await authService.getMe(req.user.userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleRegisterPatient,
  handleRegisterDoctor,
  handleLogin,
  handleGetMe
};
