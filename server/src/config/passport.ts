import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails?.[0].value }],
        });

        if (user) {
          user.googleId = profile.id;
          user.provider = 'google';
          user.isVerified = true;
          await user.save();
        } else {
          user = await User.create({
            email: profile.emails?.[0].value,
            googleId: profile.id,
            username: profile.emails?.[0].value?.split('@')[0],
            avatar: profile.photos?.[0].value || '',
            provider: 'google',
            isVerified: true,
          });
        }

        done(null, {
          _id: user._id.toString(),
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          provider: user.provider,
          isVerified: user.isVerified,
        });
      } catch (error) {
        done(error as Error);
      }
    }
  )
);

export default passport;