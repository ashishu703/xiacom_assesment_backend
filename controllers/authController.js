const asyncHandler = require('../middlewares/asyncHandler');
const authService = require('../services/authService');

const signup = asyncHandler(async (req, res) => {
  await authService.registerAccount(req.body);
  res.status(201).json({
    success: true,
    message: 'Account created - you can log in now.',
  });
});

const login = asyncHandler(async (req, res) => {
  const authSession = await authService.loginAccount(req.body);

  res.status(200).json({
    success: true,
    token: authSession.token,
    user: authSession.user,
  });
});

const me = asyncHandler(async (req, res) => {
  const currentAccount = await authService.getSessionProfile(req.userId);
  res.status(200).json({ success: true, user: currentAccount });
});

module.exports = {
  signup,
  login,
  me,
};
