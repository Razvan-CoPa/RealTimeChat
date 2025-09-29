const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('../config/config');
const { User } = require('../models');

module.exports = (passport) => {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.SECRET_KEY,
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findByPk(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }),
  );
};
