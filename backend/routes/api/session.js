const express = require("express");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { User } = require('../../db/models');

const router = express.Router();

router.post("/", async (req, res, next) => {
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
        err.title = "Login failed";
        err.errors = {
            credential: "Invalid credentials"
        };
        next(err);
    } else {
        const safeUser = {
            id: user.id,
            email: user.email,
            username: user.username
        };
        setTokenCookie(res, safeUser);
        return res.json({user: safeUser});
    }
});

router.delete("/", (_req, res) => {
    res.clearCookie("token");
    return res.json({ message: "logged out successfully" });
})

module.exports = router;

/*
fetch('/api/session', {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "XSRF-TOKEN": `PBH5RdJE-_wYfy6Wb3l2d2vuomBFOAei42A4`
  },
  body: JSON.stringify({ credential: 'Demo-lition', password: 'password' })
}).then(res => res.json()).then(data => console.log(data));
*/
