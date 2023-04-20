import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './config';
import { Prisma, PrismaClient } from '@prisma/client'
import { userInfo } from 'os';
const prisma = new PrismaClient();

interface CreateUser {
  email: string;
  name: string;
}

//This imports the strategy and sets its configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:8080/google/callback',
      passReqToCallback: true,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      try {
        const previousUser = await prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (previousUser) {
          return done(null, profile);
        } else {
          const newUserData: CreateUser = {
            email: profile.email,
            name: profile.displayName
          };
          const newUser = await prisma.user.create({
            data: newUserData
        });
        return done(null, newUser)
       }
      } catch (error) {
        return done(error, null);
      }
    }))




passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: object, done) => {
  done(null, user);
});
