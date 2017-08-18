const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('user');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user);
    });
});

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            callbackURL: '/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
            const id = profile.id;
            const name = profile.displayName;
            const pic = profile.photos[0].value;

            User.findOne({ googleId: id })
                .then(existingUser => {
                    if (existingUser) {
                        // we already have a record with teh give profie ID
                        console.log('User already exist');
                        done(null, existingUser);
                    } else {
                        new User({
                            googleId: id,
                            displayName: name,
                            photos: pic
                        })
                            .save()
                            .then(user => done(null, user));
                    }
                })
                .catch(e => done(e, null));
        }
    )
);
