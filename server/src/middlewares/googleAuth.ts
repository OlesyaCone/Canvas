import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { Request, Response, NextFunction } from 'express';
import googleAuthService from '../service/googleAuth';
import dotenv from 'dotenv';
import type { GoogleProfileType } from '../types/auth';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email']
  },
  async (accessToken: string, refreshToken: string, profile: Profile, done) => {
    try {
      const userData = await googleAuthService.authenticate(profile as GoogleProfileType);
      return done(null, userData);
    } catch (error) {
      return done(error as Error, undefined);
    }
  }
));

export const authenticateGoogle = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false
});

export const authenticateGoogleCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('google', { session: false }, (err: any, userData: any) => {
    if (err) {
      return next(err);
    }
    
    if (!userData) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    res.cookie("refreshToken", userData.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    });

    const redirectUrl = new URL(`${process.env.CLIENT_URL}/auth/callback`);
    redirectUrl.searchParams.append('accessToken', userData.accessToken);
    redirectUrl.searchParams.append('isNewUser', String(userData.isNewUser));
    
    res.redirect(redirectUrl.toString());
  })(req, res, next);
};