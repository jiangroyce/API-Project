const express = require('express');
const { User, Group, GroupImage, Venue } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

// function _safeUser(user) {
//     return {
//         id: user.id,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         username: user.username
//     };
// }

// const validateSignup = [
//     check('email')
//         .exists({ checkFalse: true })
//         .isEmail()
//         .withMessage('Please provide a valid email'),
//     check("username")
//         .exists({ checkFalsy: true })
//         .isLength({ min: 4 })
//         .withMessage("Please provide a username with at least 4 characters"),
//     check("username")
//         .not().isEmail()
//         .withMessage("Username cannot be an email"),
//     check("password")
//         .exists()
//         .isLength({ min: 6 })
//         .withMessage("Password must be 6 characters or more"),
//     check("firstName")
//         .exists({ checkFalsy: true })
//         .withMessage("Please provide your first name"),
//     check("lastName")
//         .exists({ checkFalsy: true })
//         .withMessage("Please provide your last name"),
//     handleValidationErrors
// ];

router.get("/", async (req, res) => {
    const groups = await Group.findAll();
    res.json(groups); // add numMumbers and previewImage
});

router.get("/current", requireAuth, async (req, res) => {
    const { user } = req;
    const currentUser = await User.findByPk(user.id, { include: {
        model: Group,
        through: {
            attributes: []
        }
     }});
    res.json(currentUser.Groups)   // add numMembers add previewImage
});

router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId, { include: [
        {
            model: GroupImage,
            attributes: {
                exclude: ["createdAt", "updatedAt", "groupId"]
            }
        },
        {
            association: "Organizer",
            attributes: {
                exclude: ["username", "hashedPassword", "email", "createdAt", "updatedAt"]
            }
        },
        {
            model: Venue,
            attributes: {
                exclude: ["createdAt", "updatedAt", "groupId"]
            }
        }
    ] });
    if (!group) {
        res.statusCode = 404;
        res.json({message: "Group couldn't be found"});
    }
    else res.json(group);
})
module.exports = router;
