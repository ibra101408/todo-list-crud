const passport = require('passport');
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();


const GOOGLE_CLIENT_ID = '618208179476-n1rdmsujrjeidv3uqqgaj5l0rrtgefg8.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
        clientID:     GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "https://localhost:8080/google/callback",
        passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
       return done(null, profile);
    }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});




module.exports = {
    generateSessionToken: function () {
        return uuidv4();
    },

    createSession: async function (sessionToken, userId) {
        try {
            const session = await prisma.session.create({
                data: {
                    sessionToken,
                    userId,
                    expires: new Date().toISOString(),
                },
            });

            return session;
        } catch (error) {
            throw new Error(`Error creating session: ${error}`);
        }
    },

    prisma,
};