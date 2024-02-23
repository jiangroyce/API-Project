const express = require('express');
const { User, Group, Venue, Event, Membership, Attendance } = require('../../db/models');
const { requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors, validateCreateGroup, validateEditGroup, validateCreateVenue, validateCreateEvent, validateEditMembership } = require('../../utils/validation.js');
const { _authorizationError, isOrganizer, isCoHost } = require('../../utils/authorization.js');
const { getNumMembers, formatGroups, formatEvents, formatMemberships, removeUpdatedAt } = require('../../utils/formatting.js');
const { _groupNotFound, _userNotFound, _membershipNotFound, _venueNotFound } = require("../../utils/errors.js");

const router = express.Router();

// Get All Groups
router.get("/", async (req, res) => {
    const groups = await Group.findAll({
        include: [
            {
                association: "Members"
            },
            {
                association: "GroupImages"
            },
            {
                association: "Events"
            },
            {
                association: "Venues"
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
    let resBody = formatGroups(currentUser.Members);
    resBody.forEach(group => delete group.dataValues.Membership);
    res.json({ "Groups": resBody });
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
                exclude: ["createdAt", "updatedAt"]
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
        res.statusCode = 201;
        res.json(newGroup);
    };
});

// Add image to group based on id
router.post("/:groupId/images", [requireAuth, handleValidationErrors], async (req, res) => {
    const { user } = req;
    const { groupId } = req.params;
    const { url, preview } = req.body;
    const group = await Group.findByPk(groupId, { include: { association: "Members" }});
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
router.put("/:groupId", [requireAuth, validateEditGroup], async (req, res) => {
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
        if (isOrganizer(user, group)) {
            if (name) group.name = name;
            if (about) group.about = about;
            if (type) group.type = type;
            if (private) group.private = private;
            if (city) group.city = city;
            if (state) group.state = state;
            await group.save({validate: true});
            let resBody = group.dataValues;
            delete resBody.Members;
            delete resBody.GroupImages
            res.json(resBody);
        }
        else return _authorizationError(res);
    }
});

// Delete a group
router.delete("/:groupId", requireAuth, async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, { include: { association: "Members" } });
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
    const group = await Group.findByPk(req.params.groupId, { include: [{ model: Venue }, { association: "Members" }] });
    if (!group) return _groupNotFound(res);
    else {
        if (isCoHost(user, group)) {
            res.json({ "Venues": group.Venues });
        }
        else return _authorizationError(res);
    }
});


// create Venue for groupId
router.post("/:groupId/venues", [requireAuth, validateCreateVenue], async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, { include: [{ model: Venue }, { association: "Members" }]});
    const { address, city, state, lat, lng } = req.body;
    if (!group) return _groupNotFound(res);
    else {
        if (isCoHost(user, group)) {
            const newVenue = await group.createVenue({
                address,
                city,
                state,
                lat,
                lng
            });
            res.json(removeUpdatedAt(newVenue));
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
                },
                {
                    association: "Attendees"
                },
                {
                    association: "EventImages"
                }
            ],
            attributes: {
                exclude: ["capacity", "price", "createdAt", "updatedAt"]
            },
        },
    });
    if (!group) return _groupNotFound(res);
    else {
        res.json({ "Events": formatEvents(group.Events) });
    }
});

// Create Event based on groupId
router.post("/:groupId/events", [requireAuth, validateCreateEvent], async (req, res) => {
    const { user } = req;
    const group = await Group.findByPk(req.params.groupId, { include: { association: "Members" }});
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    if (!group) return _groupNotFound(res);
    else {
        // if there is venueId input
        // check if venue exists
        if (parseInt(venueId)) {
            const venue = await Venue.findByPk(venueId);
            if (!venue) return _venueNotFound(res);
        }
        if (isCoHost(user, group)) {
            const newEvent = await group.createEvent({
                venueId, name, type, capacity, price, description, startDate: startDate, endDate: endDate
            });
            const newAttendance = await Attendance.create(
                {
                    status: "host",
                    userId: user.id,
                    eventId: newEvent.id
                }
            );
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
    if (isCoHost(user, group)) return res.json({ "Members": group.Members });
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
        let resBody = formatMemberships(newMembership);
        return res.json(resBody);
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
                    return res.json(formatMemberships(membership));
                }
                else return _authorizationError(res);
            }
            else {
                if (isOrganizer(user, group)) {
                    membership.status = status;
                    await membership.save();
                    return res.json(formatMemberships(membership));
                }
                else return _authorizationError(res);
            }
        }
        else {
            if (isOrganizer(user, group)) {
                membership.status = status;
                await membership.save();
                return res.json(formatMemberships(membership));
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
        if (isOrganizer(user, group) || user.id == memberId) {
            await membership.destroy();
            res.json({ message: "Successfully deleted membership from group"});
        }
        else return _authorizationError(res);
    }
});

module.exports = router;
