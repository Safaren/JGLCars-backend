// config/passport.js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function setupPassport() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn("⚠️  GOOGLE_CLIENT_ID no configurado. Google OAuth no funcionará.");
    return;
  }

  const isDev = process.env.NODE_ENV !== "production";
  const callbackURL = isDev 
    ? "http://localhost:4000/api/auth/google/callback"
    : "https://jlgcars-api.onrender.com/api/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const prisma = require("./prisma");
          const email = profile.emails && profile.emails[0] && profile.emails[0].value;

          let user = null;

          if (email) {
            user = await prisma.user.findUnique({ where: { email } }).catch(() => null);
          }

          if (!user && email) {
            user = await prisma.user.create({
              data: {
                email,
                nombre: profile.displayName || null,
                rol: "User",
              },
            });
            console.log("✅ Usuario Google creado:", email);
          } else if (user) {
            console.log("✅ Usuario Google encontrado:", email);
          }

          done(null, user);
        } catch (err) {
          console.error("❌ Error en Google Strategy:", err.message);
          done(err, null);
        }
      }
    )
  );
};
