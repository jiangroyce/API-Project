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
function getNumMembers(group) {
    return group.Members.filter(user => user.Membership.status != "pending").length;
};
function getPreviewImage(group) {
    if (group.GroupImages.length) return group.GroupImages[0].preview ? group.GroupImages[0].url : false;
    else return false;
};
function formatGroups(groups) {
    groups.forEach((group) => {
        let newGroup = group.dataValues;
        newGroup.numMembers = getNumMembers(newGroup);
        newGroup.previewImage = getPreviewImage(newGroup);
        delete newGroup.Members;
        delete newGroup.GroupImages;
        group.dataValues = newGroup
    });
    return groups;
};
function _authorizationError(res) {
    res.statusCode = 403;
    res.json({ message: "Forbidden" });
}
function isOrganizer(user, group) {
    return group.organizerId == user.id;
}
function isPartOf(user, group) {
    let members = group.Members.map(member => member.id)
    return members.includes(user.id);
}
router.get("/", async (req, res) => {
    const groups = await Group.findAll();
    res.json({"Groups": formatGroups(groups)}); // add numMumbers and previewImage
});

router.get("/current", requireAuth, async (req, res) => {
    const { user } = req;
    const currentUser = await User.findByPk(user.id, { include: {
        association: "Members",
        through: {
            attributes: []
        }
     }});
    res.json({"Groups": formatGroups(currentUser.Members)});  // add numMembers add previewImage
});

router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.scope(null).findByPk(groupId, { include: [
        {
            association: "Members"
        },
        {
            association: "GroupImages",
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
    else {
        group.dataValues.numMembers = getNumMembers(group);
        delete group.dataValues.Members;
        res.json(group);
    }
});

const validateCreateGroup = [
    check('name')
        .isLength({ min: 1, max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .isIn(["Online", "In person"])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    handleValidationErrors
]

// Create a Group
router.post("/", [requireAuth, validateCreateGroup], async (req, res) => {
    const { user } = req;
    const { name, about, type, private, city, state } = req.body;
    const newGroup = await user.createMember( {
        organizerId: user.id,
        name,
        about,
        type,
        private,
        city,
        state
    })
    if (newGroup) {
        // newGroup.createMember({
        //     status: "co-host",
        //     userId: user.id
        // });
        res.statusCode = 201;
        res.json(newGroup);
    };
});

// Add image to group based on id
router.post("/:groupId/images", [requireAuth, handleValidationErrors], async (req, res) => {
    const { user } = req;
    const { groupId } = req.params;
    const { url, preview } = req.body;
    const group = await Group.findByPk(groupId);
    if (!group) {
        return _groupNotFound(res);
    }
    else {
        console.log(isOrganizer(user, group))
        if (isOrganizer(user, group)) {
            const newImage = await group.createGroupImage({
                url,
                preview
        });
        let resBody = { id : newImage.id, url, preview }
        res.json(resBody);
        }
        else {
            return _authorizationError(res);
        }
    }
});

// edit a group
router.put("/:groupId", [requireAuth, handleValidationErrors], async (req, res) => {
    // add authorization: group must belong to current user
    const { user } = req;
    const { groupId } = req.params;
    const { name, about, type, private, city, state } = req.body;
    const group = await Group.findByPk(groupId);
    if (!group) {
        return _groupNotFound(res);
    } else {
        if (isOrganizer(user, group, res)) {
            if (name) group.name = name;
            if (about) group.about = about;
            if (type) group.type = type;
            if (private) group.private = private;
            if (city) group.city = city;
            if (state) group.state = state;
            await group.save({validate: true});
            res.statusCode = 201;
            res.json(formatGroups([group]));
        }
        else return _authorizationError(res);
    }
});

// Delete a group
router.delete("/:groupId", requireAuth, async (req, res) => {
    // add authorization: group must belong to current user
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if (!group) {
        return _groupNotFound(res);
    } else {
        if (isOrganizer(user, group, res)) {
            await group.destroy();
            res.json({ message: "Successfully deleted"});
        }
        else return _authorizationError(res);
    }
});

// get Memberships
router.get("/:groupId/members", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId);
    res.json(group.Members);
});

// get Venues for groupId
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
test get /groupid/venues


DRY up group = await Group.findByPk(...)

Issues:
Right now the seeder undos are dynamically deleting based on name I seeded, if changed name will error?

Authorization: group belongs to current user doesn't make sense, only organizer should be able to update/delete

Membership:

*/
