import express from 'express';
import authRoute from './auth/route';
import userRoute from './user/route';
import docsRoute from './docs/route';
import programRoute from './program/route';
import programRegistrationRoute from './program-registration/route';
import paymentRoute from './payment/route';
import membershipRoute from './membership/route';
import memberRoute from './member/route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute
  },
  {
    path: '/users',
    route: userRoute
  },
  {
    path: '/payment',
    route: paymentRoute
  },
  {
    path: '/programs',
    route: programRoute
  },
  {
    path: '/program-registrations',
    route: programRegistrationRoute
  },
  {
    path: '/memberships',
    route: membershipRoute
  },
  {
    path: '/members',
    route: memberRoute
  }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute
  }
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
