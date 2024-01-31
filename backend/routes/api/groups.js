const express = require('express');
const { User, Group, Venue, Event, Membership } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation.js');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');
const { Op } = require("sequelize");
const router = express.Router();

// Helper Functions:
// Group Functions
function _groupNotFound(res) {
    res.statusCode = 404;
    res.json({message: "Group couldn't be found"});
};
function _userNotFound(res) {
    res.statusCode = 404;
    res.json({message: "User couldn't be found"});
}
function _membershipNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Membership between the user and the group does not exist" })
}
// Group Formatting Functions
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

// Endpoints:
// Get All Groups
router.get("/", async (req, res) => {
    const groups = await Group.findAll({
        include: [
            {
                association: "Members"
            },
            {
                association: "GroupImages"
            }
        ]
    });
    res.json({"Groups": formatGroups(groups)});
});

// Get Groups current user is part of
router.get("/current", requireAuth, async (req, res) => {
    const { user } = req;
    const currentUser = await User.findByPk(user.id, { include: {
        association: "Members",
        include: [
            {
                association: "Members"
            },
            {
                association: "GroupImages"
            }
        ],
        through: {
            attributes: ["status"]
        }
    }
    });
    res.json({ "Groups": formatGroups(currentUser.Members) });
});

// Get Group details by id
router.get("/:groupId", async (req, res) => {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId, { include: [
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
            attributes: ["id", "firstName", "lastName"]
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

// Express Validator for Create Group
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
    const group = await Group.findByPk(groupId, {
        include: [
            {
                association: "Members"
            },
            {
                association: "GroupImages"
            }
        ]
    });
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
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    if (!group) {
        return _groupNotFound(res);
    } else {
        if (isOrganizer(user, group)) {
            await group.destroy();
            res.json({ message: "Successfully deleted"});
        }
        else return _authorizationError(res);
    }
});

// get Venues for groupId
router.get("/:groupId/venues", requireAuth, async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, { include: { model: Venue } });
    if (!group) return _groupNotFound(res);
    else {
        if (isOrganizer(user, group) || isCoHost(user, group)) {
            res.json({ "Venues": group.Venues });
        }
        else return _authorizationError(res);
    }
});

const validateCreateVenue = [
    check('address')
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
    check('city')
    .exists({ checkFalsy: true })
    .withMessage("City is required"),
    check('state')
    .exists({ checkFalsy: true })
    .withMessage("State is required"),
    check('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be within -90 and 90"),
    check('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be within -180 and 180"),
    handleValidationErrors
]

// create Venue for groupId
router.post("/:groupId/venues", [requireAuth, validateCreateVenue], async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    const { address, city, state, lat, lng } = req.body;
    if (!group) return _groupNotFound(res);
    else {
        if (isOrganizer(user, group) || isCoHost(user, group)) {
            const newVenue = await group.createVenue({
                address,
                city,
                state,
                lat,
                lng
            });
            res.json(newVenue);
        }
        else return _authorizationError(res);
    }
});

// Get all Events by groupId
router.get("/:groupId/events", async (req, res) => {
    const group = await Group.findByPk(req.params.groupId, {
        include: {
            model: Event,
            include: [
                {
                    association: "Group",
                    attributes: ["id", "name", "city", "state"]
                },
                {
                    association: "Venue",
                    attributes: ["id", "city", "state"]
                }
            ],
            attributes: {
                exclude: ["description", "capacity", "price", "createdAt", "updatedAt"]
            },
        },
    });
    if (!group) return _groupNotFound(res);
    else {
        res.json({ "Events": group.Events });
    }
});

const validateCreateEvent = [
    check('name')
    .isLength({ min: 5 })
    .withMessage("Name must be at least 5 characters"),
    check('type')
    .isIn(["Online", "In person"])
    .withMessage("Type must be Online or In person"),
    check('capacity')
    .isInt({ min: 0 })
    .withMessage("Capacity must be an integer"),
    check('price')
        .isFloat({ min: 0 })
        .withMessage("Price is invalid"),
        check('description')
        .exists({ checkFalsy: true })
        .withMessage("Description is required"),
        check('startDate')
        .isLength({ min: 18 })
        .withMessage("Start date must be a valid date in YYYY-MM-DD HH:MM:SS format"),
        check('endDate')
        .isLength({ min: 18 })
        .withMessage("End date must be a valid date in YYYY-MM-DD HH:MM:SS format"),
        handleValidationErrors
]

// Create Event based on groupId
router.post("/:groupId/events", [requireAuth, validateCreateEvent], async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId);
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    if (!group) return _groupNotFound(res);
    else {
        // if there is venueId input
        // check if venue exists
        if (parseInt(venueId)) {
            const venue = await Venue.findByPk(venueId);
            if (!venue) {
                res.statusCode = 404;
                return res.json({ message: "Venue couldn't be found" });
            }
        }
        if (isOrganizer(user, group) || isCoHost(user, group)) {
            const newEvent = await group.createEvent({
                venueId, name, type, capacity, price, description, startDate: startDate, endDate: endDate
            });
            let resBody = newEvent.dataValues;
            delete resBody.createdAt;
            delete resBody.updatedAt;
            res.json(resBody);
        }
        else return _authorizationError(res);
    }
});

// get Memberships
router.get("/:groupId/members", async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, {
        include: {
            association: "Members",
            through: {
                attributes: ["status"]
            }
        }
    });
    if (!group) return _groupNotFound(res);
    // if organizer or cohost, show all
    if (isOrganizer(user, group) || isCoHost(user, group)) return res.json({ "Members": group.Members });
    else {
        return res.json({ "Members": group.Members.filter(user => user.Membership.status !== "pending") });
    }
});

// Request Membership for group based on groupId
router.post("/:groupId/membership", requireAuth, async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, {
        include: {
            association: "Members",
            through: {
                attributes: ["status"]
            }
        }
    });
    if (!group) return _groupNotFound(res);
    // check membership
    // console.log(JSON.stringify(group.Members))
    const memberships = group.Members.map(member => {
        const { id } = member;
        const status = member.Membership.status;
        return { id, status };
    })
    // console.log(memberships);
    // if doesn't have membership
    if (!memberships.map(member => member.id).includes(user.id)) {
        const newMembership = await Membership.create(
            {
                status: "pending",
                userId: user.id,
                groupId: group.id
            }
        );
        return res.json(newMembership);
    }
    else {
        if (memberships.filter(member => member.id == user.id)[0].status == "pending") {
            res.statusCode = 400;
            return res.json({ "message": "Membership has already been requested" });
        }
        else {
            res.statusCode = 400;
            return res.json({ "message": "User is already a member of the group" });
        }
    }
});

const validateEditMembership = [
    check('memberId')
        .isInt({ min: 1 })
        .withMessage("Invalid memberId"),
    check('status')
        .isIn(["pending", "member", "co-host"])
        .withMessage("Invalid status"),
    handleValidationErrors
]
// Change status of membership by groupId
router.put("/:groupId/membership", [requireAuth, validateEditMembership], async (req, res) => {
    const { user } = req;
    const { groupId } = req.params;
    const { memberId, status } = req.body;
    if (status == "pending") {
        res.statusCode = 400;
        return res.json({
            "message": "Bad Request",
            "errors": {
              "status" : "Cannot change a membership status to pending"
            }
        });
    };
    const group = await Group.findByPk(req.params.groupId, {
        include: {
            association: "Members"
        }
    });
    if (!group) return _groupNotFound(res);
    const member = await User.findByPk(memberId);
    if (!member) return _userNotFound(res);
    const membership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    });
    if (!membership) return _membershipNotFound(res);
    else {
        if (membership.status == "pending") {
            if (status == "member") {
                if (isCoHost(user, group)) {
                    membership.status = status;
                    await membership.save();
                    return res.json(membership);
                }
                else return _authorizationError(res);
            }
            else {
                if (isOrganizer(user, group)) {
                    membership.status = status;
                    await membership.save();
                    return res.json(membership);
                }
                else return _authorizationError(res);
            }
        }
        if (membership.status == "member") {
            if (isOrganizer(user, group)) {
                membership.status = status;
                await membership.save();
                return res.json(membership);
            }
            else return _authorizationError(res);
        }
        else {
            if (isOrganizer(user, group)) {
                membership.status = status;
                await membership.save();
                return res.json(membership);
            }
            else return _authorizationError(res);
        }
    }
});

// Delete membership to a group by groupId
router.delete("/:groupId/membership/:memberId", requireAuth, async (req, res) => {
    const { user } = req;
    const { groupId, memberId } = req.params;
    const member = await User.findByPk(memberId);
    if (!member) return _userNotFound(res);
    const group = await Group.findByPk(groupId, { include: { association: "Members" } });
    if (!group) return _groupNotFound(res);
    const membership = await Membership.findOne({
        where: {
            userId: memberId,
            groupId: groupId
        }
    });
    if (!membership) return _membershipNotFound(res);
    else {
        if (isCoHost(user, group) || user.id == memberId) {
            await membership.destroy();
            res.json({ message: "Successfully deleted membership from group"});
        }
        else return _authorizationError(res);
    }
});

module.exports = router;

    /*

    Todo:

    DRY up group = await Group.findByPk(...)

    Issues:

    Authorization: group belongs to current user doesn't make sense, only organizer should be able to update/delete

    Membership:
    if organizer deletes himself what to do

    */
