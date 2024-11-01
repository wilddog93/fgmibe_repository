import prisma from '../client';
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import {
  Strategy as GoogleStrategy,
  VerifyCallback as VerifyCallbackGoogle
} from 'passport-google-oauth20';

import { Strategy as GithubStrategy } from 'passport-github2';

import { TokenType } from '@prisma/client';
import { userService } from '../services';
import { Profile } from 'passport';
import { encryptPassword } from '../utils/encryption';
import config from './config';

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify: VerifyCallback = async (payload, done) => {
  try {
    if (payload.type !== TokenType.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        name: true
      },
      where: { id: payload.sub }
    });
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const googleVerify = async (
  accessToken: string,
  refreshToken: string,
  user: Profile,
  done: VerifyCallbackGoogle
) => {
  try {
    const existingUser = await userService.getUserByEmail(user?.emails?.[0].value as string);
    if (existingUser) {
      return done(null, existingUser);
    }

    // Create new user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        email: user?.emails?.[0].value as string,
        name: user.displayName,
        accounts: {
          create: {
            providerAccountId: user.id,
            provider: 'google',
            type: 'google'
          }
        },
        password: await encryptPassword('password'),
        isEmailVerified: true // Google accounts are already verified
      }
    });

    done(null, newUser);
  } catch (error) {
    done(error);
  }
};

const githubVerify = async (
  accessToken: string,
  refreshToken: string,
  user: Profile,
  done: VerifyCallbackGoogle
) => {
  try {
    const provider = user.provider as string;
    if (provider !== 'github') {
      return done(null, false);
    }
    const existingUser = await userService.getUserByEmail(user?.emails?.[0].value as string);
    if (existingUser) {
      return done(null, existingUser);
    }

    // Create new user if doesn't exist
    const newUser = await prisma.user.create({
      data: {
        email: user?.emails?.[0].value as string,
        name: user.displayName,
        accounts: {
          create: {
            providerAccountId: user.id,
            provider: 'github',
            type: 'github'
          }
        },
        password: await encryptPassword('password'),
        isEmailVerified: true // Github accounts are already verified
      }
    });

    done(null, newUser);
  } catch (error) {
    done(error);
  }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);
export const googleStrategy = new GoogleStrategy(
  {
    clientID: config.google.cliendID as string,
    clientSecret: config.google.clientSecret as string,
    callbackURL: `${config.url}/v1/auth/google/callback`
  },
  googleVerify
);

export const githubStrategy = new GithubStrategy(
  {
    clientID: config.github.cliendID as string,
    clientSecret: config.github.clientSecret as string,
    callbackURL: `${config.url}/v1/auth/github/callback`
  },
  githubVerify
);
