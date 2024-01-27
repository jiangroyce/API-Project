const express = require('express');
const bcrypt = require('bcryptjs');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

function _safeUser(user) {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username
    };
}

const validateSignup = [
    check('email')
        .exists({ checkFalsy: true })
        .isEmail()
        .withMessage('Please provide a valid email'),
    check("username")
        .exists({ checkFalsy: true })
        .isLength({ min: 4 })
        .withMessage("Please provide a username with at least 4 characters"),
    check("username")
        .not().isEmail()
        .withMessage("Username cannot be an email"),
    check("password")
        .exists()
        .isLength({ min: 6 })
        .withMessage("Password must be 6 characters or more"),
    check("firstName")
        .exists({ checkFalsy: true })
        .withMessage("First Name is required"),
    check("lastName")
        .exists({ checkFalsy: true })
        .withMessage("Last Name is required"),
    handleValidationErrors
];

router.post("/", validateSignup, async (req, res) => {
    const { email, username, password, firstName, lastName } = req.body;
    const hashedPassword = bcrypt.hashSync(password);
    const user = await User.create({ email, username, hashedPassword, firstName, lastName });

    const safeUser = _safeUser(user);

    setTokenCookie(res, safeUser);
    return res.json({ user: safeUser });
});

module.exports = router;
