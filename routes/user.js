const express = require("express");
const { route } = require("./listings");
const router = express.Router();
const user = require("../models/user.js");
const wrapAysnc = require("../utils/wrapAysnc");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


router
    .route("/signup")
    .get(userController.renderSignup)
    .post(wrapAysnc(userController.signup));

router
    .route("/login")
    .get(userController.renderLogin)
    .post(saveRedirectUrl,
        passport.authenticate('local',
             { failureRedirect: '/user/login',
                 failureFlash: true}),userController.login);

router.get("/logout", userController.logout);

module.exports = router;