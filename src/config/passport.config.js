import passport from "passport";
import LocalStrategy from "passport-local";
import GitHubStrategy from "passport-github2";
import userModel from "../dao/models/user.js";
import { createHash, isValidPassword } from "../utils.js";
//import Swal from "sweetalert2/dist/sweetalert2.js";
import Swal from "sweetalert2";
//const LocalStrategy = local.localStrategy;
const initializePassport = () => {
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age, rol } = req.body;
        try {
          let user = await userModel.findOne({ email: username });
          if (user) {
            console.log("El usuario ya existe");

            return done(null, false);
          }
          let newUser = {
            first_name,
            last_name,
            email,
            password: createHash(password),
            age,
            rol,
          };
          let result = await userModel.create(newUser);
          return done(null, result);
        } catch (err) {
          return done("Error al obtener el usuario " + err);
        }
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ email: username });
          if (!user) {
            console.log("El ususario no existe");
            done("ususerio no existe", false);
          }
          if (!isValidPassword(user, password)) {
            console.log("cONTRASEÑA INVALIDA!!!");
            done(null, false);
          }
          console.log("entro bien?  ");
          done(null, user);
        } catch (err) {
          console.log("error", err);
          done(err);
        }
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.22a627eb7aabde5d",
        clientSecret: "20d4ce3191a42cb02b37ad8bb662487e80152580",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          let user = await userModel.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 18,
              email: profile._json.email,
              password: "",
              rol: "",
            };

            let result = await userModel.create(newUser);
            done(null, result);
          } else {
            console.log("el ususario ya existe");
            done(null, user);
          }
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = userModel.findById(id);
    done(null, user);
  });
};

export default initializePassport;
