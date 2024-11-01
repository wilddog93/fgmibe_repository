import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { authService, userService, tokenService, emailService } from '../services';
import exclude from '../utils/exclude';
import { User } from '@prisma/client';
import passport from 'passport';

const authMe = catchAsync(async (req, res) => {
  const { id } = req.user as User;

  const user = await userService.getUserById(id);

  return res.json({
    data: {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role
      }
    }
  });
});

const register = catchAsync(async (req, res) => {
  const { email, password, name } = req.body;
  const user = await userService.createUser(email, password, name);
  const userWithoutPassword = exclude(user, ['password', 'createdAt', 'updatedAt']);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user: userWithoutPassword, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ data: { user, tokens } });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ data: { tokens } });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token as string, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const user = req.user as User;
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(user);
  await emailService.sendVerificationEmail(user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token as string);
  res.status(httpStatus.NO_CONTENT).send();
});

const googleLogin = catchAsync(async (req, res) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
});

const googleCallback = catchAsync(async (req, res) => {
  const user = req.user as any;
  const tokens = await tokenService.generateAuthTokens({ id: user.id });
  res.send({ user, tokens });
});

const githubLogin = catchAsync(async (req, res) => {
  passport.authenticate('github', { scope: ['user:email'] })(req, res);
});

const githubCallback = catchAsync(async (req, res) => {
  const user = req.user as any;
  const tokens = await tokenService.generateAuthTokens({ id: user.id });
  res.send({ user, tokens });
});

export default {
  authMe,
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback
};
