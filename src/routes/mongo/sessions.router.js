import { Router } from "express";
import userModel from "../../dao/models/user.js";
import passport from "passport";

const router = Router();

router.get(
  "/github",
  passport.authenticate(
    "github",
    { scope: ["user:email"] },
    async (req, res) => {}
  )
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    console.log("usuario recibe gitHub -> ", req.user);
    let idUser = JSON.stringify(req.user._id);
    let id = "";
    id = idUser.split('"');
    console.log(id[1]);
    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      email: req.user.email,
      id: id[1],
      age: req.user.age,
    };
    console.log(req.session.user);
    res.redirect("/api/products");

    // res.send({ status: "success", payload: req.user });
  }
);

router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/login" }),
  async (req, res) => {
    console.log("Entro a registrar un user...");
    res.status(201).json({ status: "success", message: "Usuario Registrado" });
  }
);

router.post("/login", passport.authenticate("login"), async (req, res) => {
  console.log("entro a loguearse, ", req.user);
  if (!req.user)
    return res
      .status(400)
      .send({ status: "error", error: "credenciales invalidas" });

  try {
    let idUser = JSON.stringify(req.user._id);
    console.log(idUser);
    let id = "";
    id = idUser.split('"');
    console.log(id[1]);
    let infoUsuario = await userModel.findById(id[1]);
    console.log(
      "55 sessionRouter - Informacion usuario logueado ->",
      infoUsuario
    );
    req.session.user = {
      first_name: infoUsuario.first_name,
      last_name: infoUsuario.last_name,
      email: infoUsuario.email,
      id: id[1],
      age: infoUsuario.age,
      rol: infoUsuario.rol,
    };
    console.log("User Session en login -> ", req.session.user);
    res.send({ status: "success", payload: req.user });
    //res.status(201).json(user);
  } catch (error) {
    console.log("no se pudo realizar la operacion ", error);
    //res.send({ status: "error", error: error });
  }
});

//SIN PASSPORT
// router.post("/register", async (req, res) => {
//   console.log("Entro a registrar un user...");
//   console.log(req.body);
//   let { first_name, last_name, email, age, password, rol } = req.body;
//   console.log(
//     "line 10: session router",
//     first_name,
//     last_name,
//     email,
//     age,
//     password,
//     rol
//   );
//   try {
//     let user = await userModel.create({
//       first_name,
//       last_name,
//       email,
//       age,
//       password,
//       rol,
//     });
//     // res.send({ status: "success", payload: result });
//     console.log("usuarui creado...");
//     res.status(201).json({ status: "success", result: user });
//   } catch (err) {
//     console.log("ocurrio un error...");
//     res.send({ status: "error en try catch de router...", err: err });
//   }
// });

// router.post("/login", async (req, res) => {
//   let { email, password } = req.body;
//   let user = "";
//   console.log("usuario que se va a logear -> ", email, password);
//   if (email == "adminCoder@coder.com" && password == "adminCod3r123") {
//     console.log("es igual a superAdmin...");
//     user = {
//       first_name: "Super",
//       last_name: "Admin",
//       email: "adminCoder@coder.com",
//       age: 999,
//       password: "adminCod3r123",
//       rol: "Super-Administrador",
//     };
//   } else {
//     user = await userModel.findOne({ email: email, password: password });
//     console.log("login use- >", user);
//     if (!user) return res.status(401).send({ status: "error", error: user });
//   }

//   req.session.user = {
//     name: `${user.first_name} ${user.last_name}`,
//     email: user.email,
//     rol: user.rol,
//   };

//   // res.send.status(200);
//   res.status(201).json({ status: "success", payload: user });
// });

router.get("/user/:id", (req, res) => {
  console.log("buscando info usuario...");
  let id = req.params.id;
  console.log("130", id);
  try {
    let user = userModel.findById(id);
    console.log(user);
    res.status(201).json(user);
  } catch (error) {
    console.log("no se pudo obtener la información ");
    res.send(401).json({ status: "error", error: error });
  }
});

router.get("/logoutSession", (req, res) => {
  //let { email } = req.body;

  req.session.destroy((err) => {
    if (err) {
      return res.json({ status: "Logout error", body: err });
    }
    res.status(201).json({ status: "success", payload: "logout ok!" });
    console.log("Se cerro la sesion correctamente...");
  });
});

export default router;
