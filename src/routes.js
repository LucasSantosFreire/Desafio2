const express = require("express");
const routes = express.Router();
const UserController = require("./controllers/UserController");
const RecipientController = require("./controllers/RecipientController");
const { username } = require("./config/database");
const Autenticar = require("./midlewares/AutenticarToken");

routes.post("/login", UserController.login);
routes.post("/logout", UserController.logout);

//---USERS---//
routes.post("/dashboard/users", Autenticar, UserController.store);
routes.get("/dashboard/users", Autenticar, UserController.index);
routes.get("/dashboard/my-profile", Autenticar, UserController.personalIndex);
routes.put("/dashboard/my-profile", Autenticar, UserController.personalChange);
routes.delete("/my-profile", Autenticar, UserController.personalDelete);

//---RECIPIENTS---//
routes.post("/dashboard/recipient", Autenticar, RecipientController.store);
routes.get("/dashboard/recipient", Autenticar, RecipientController.index);
routes.get(
    "/dashboard/recipient/:id",
    Autenticar,
    RecipientController.personalIndex
);
routes.put(
    "/dashboard/recipient/:id",
    Autenticar,
    RecipientController.personalChange
);
routes.delete(
    "/dashboard/recipient/:id",
    Autenticar,
    RecipientController.personalDelete
);
module.exports = routes;
