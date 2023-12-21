const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { User } = require('../../db/models');
// validations
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation.js");

function _safeUser(user) {
    return {
        id: user.id,
        email: user.email,
        username: user.username
    };
}

const validateLogin = [
    check("credential")
        .exists({ checkFalsy: true})
        .notEmpty()
        .withMessage("Please provide a valid email or username"),
    check("password")
        .exists({ checkFalsy: true })
        .withMessage("Please provide a password"),
    handleValidationErrors
];

const router = express.Router();

// Login
router.post("/", validateLogin, async (req, res, next) => {
    const { credential, password } = req.body;
    console.log(credential);
    // find user
    const user = await User.scope(null).findOne({
        where: {
            [Op.or]: [{ username: credential }, { email: credential }] // on either username or email
        }
    });

    // if user not found
    if (!user || !bcrypt.compareSync(password, user.hashedPassword.toString())) {
        const err = new Error("Login failed");
        err.status = 401;
        err.title = "Login failed";
        err.errors = {
            credential: "Invalid credentials"
        };
        next(err);
    } else {
        const safeUser = _safeUser(user);
        setTokenCookie(res, safeUser);
        return res.json({user: safeUser});
    }
});

// Logout
router.delete("/", (_req, res) => {
    res.clearCookie("token");
    return res.json({ message: "logged out successfully" });
});

// Get Session
router.get("/", (req, res) => {
    const { user } = req;
    if (user) {
        const safeUser = _safeUser(user);
        return res.json({ user: safeUser});
    } else return res.json({ user: null });
});

module.exports = router;
