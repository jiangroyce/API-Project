const express = require('express');
const { User, Group, GroupImage, Venue, sequelize } = require('../../db/models');
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

function _groupNotFound(res) {
    res.statusCode = 404;
    res.json({message: "Group couldn't be found"});
};

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
        return _groupNotFound(res);
    }
    else res.json(group);
});

router.post("/", [requireAuth, handleValidationErrors], async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    const newGroup = await Group.create( {
        name,
        about,
        type,
        private,
        city,
        state
    })
    if (newGroup) {
        res.statusCode = 201;
        res.json(newGroup);
    };
});

// Add image to group based on id
router.post("/:groupId/images", [requireAuth, handleValidationErrors], async (req, res) => {
    // add authorization for organizer
    const { groupId } = req.params;
    const { url, preview } = req.body;
    const group = await Group.findByPk(groupId);
    if (!group) {
        return _groupNotFound(res);
    }
    else {
        const newImage = await group.createGroupImage({
            url,
            preview
        });
    }
});

// edit a group
router.put("/:groupId", [requireAuth, handleValidationErrors], async (req, res) => {
    // add authorization: group must belong to current user
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.findByPk(groupId);
    if (!group) {
        return _groupNotFound(res);
    } else {
        // update stuff
    }
});

router.delete("/:groupId", requireAuth, async (req, res) => {
    // add authorization: group must belong to current user
    const group = await Group.findByPk(req.params.groupId);
    if (!group) {
        return _groupNotFound(res);
    } else {
        group.destroy();
        res.json({ message: "Successfully deleted"});
    }
});

router.get("/:groupId/venues", requireAuth, async (req, res) => {
    // add authorization: currentUser must be organizer or co-host of group
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return _groupNotFound(res);
    const venues = await Venue.findAll();
    res.json(venues);
});

router.post("/:groupId/venues", requireAuth, async (req, res) => {
    // add authorization
    const group = await Group.findByPk(req.params.groupId);
    if (!group) return _groupNotFound(res);
    const { address, city, state, lat, lng } = req.body;
    const newVenue = await group.createVenue({
        address,
        city,
        state,
        lat,
        lng
    });
    res.json(newVenue);
})


module.exports = router;

/*

Todo:
make require authorization for organizer
make require authorization for group belongTo current user
test get /
test post /
put /:groupId
test delete /:groupId
test get /groupid/venues


DRY up group = await Group.findByPk(...)

*/
