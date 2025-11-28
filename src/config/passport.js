/*
// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const prisma = require("./prisma"); // tu config prisma

module.exports = function setupPassport() {
  // Google
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Buscar usuario por providerId
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // crear usuario
            user = await prisma.user.create({
              data: {
                email: email || `google-${profile.id}@noemail.local`,
                name: profile.displayName || null,
                provider: "google",
                providerId: profile.id,
                rol: "user",
              },
            });
          } else {
            // actualizar provider si falta
            await prisma.user.update({
              where: { id: user.id },
              data: { provider: "google", providerId: profile.id },
            }).catch(() => {});
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // Facebook
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: email || `facebook-${profile.id}@noemail.local`,
                name: profile.displayName || null,
                provider: "facebook",
                providerId: profile.id,
                rol: "user",
              },
            });
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { provider: "facebook", providerId: profile.id },
            }).catch(() => {});
          }

          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );

  // (No serialización persistente necesaria para JWT flow; dejamos minimal)
};
*/