const express = require('express');
const { User, Group, GroupImage, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { check, query } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');
const { Op } = require("sequelize");

const router = express.Router();

// Helper Functions:
function _eventNotFound(res) {
    res.statusCode = 404;
    res.json({message: "Event couldn't be found"});
}
function _userNotFound(res) {
    res.statusCode = 404;
    res.json({message: "User couldn't be found"});
}
function _attendanceNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Attendance between the user and the event does not exist" })
}
// Event Formatting Functions
function getAttendees(event) {
    return event.Attendees.filter(user => user.Attendance.status == "attending").length;
};
function getPreviewImage(event) {
    if (event.EventImages.length) return event.EventImages[0].preview ? event.EventImages[0].url : false;
    else return false;
};
function formatEvents(events) {
    events.forEach((event) => {
        let newEvent = event.dataValues;
        newEvent.numAttending = getAttendees(newEvent);
        newEvent.previewImage = getPreviewImage(newEvent);
        delete newEvent.Attendees;
        delete newEvent.EventImages;
        event.dataValues = newEvent
    });
    return events;
};
// Endpoints:

// Get All Events
router.get("/", async (req, res, next) => {
    let query = {
        attributes: {
            exclude: ["description", "capacity", "price"]
        },
        include: [
        {
          association: "Attendees"
        },
        {
          association: "EventImages"
        },
        {
          association: "Group",
          attributes: ["id", "name", "city", "state"],
        },
        {
          association: "Venue",
          attributes: ["id", "city", "state"],
        }],
        where: {}
    };
    let err = new Error("Bad Request")
    let errors = {};
    // page and size options
    let { page, size } = req.query;
    // Page
    if (page === undefined) page = 1;
    else if (isNaN(parseInt(page)) || parseInt(page) == 0) errors.page = "Page must be greater than or equal to 1";
    else page = parseInt(page);
    // Size
    if (size === undefined) size = 20;
    else if (isNaN(parseInt(size)) || parseInt(size) == 0) errors.size = "Size must be greater than or equal to 1";
    else size = parseInt(size);
    if (page >= 1 && size >= 1) {
        query.limit = Math.min(size, 20)
        query.offset = Math.min(size, 20) * (Math.min(page, 10) - 1);
    };

    // name, type, startDate
    const { name, type, startDate } = req.query;
    if (name) {
        if (typeof name !== "string") errors.name = "Name must be a string"
        query.where.name = { [Op.like]: "%"+name+"%" };
    }
    if (type) {
        if (!["Online", "In person"].includes(type)) errors.type = "Type must be 'Online' or 'In person'"
        query.where.type = { [Op.like]: "%"+type+"%" };
    }
    if (startDate) {
        if (startDate.length !== 19 || !startDate.match(/^\d\d\d\d-(0?[1-9]|1[0-2])-(0?[1-9]|[12][0-9]|3[01]) (00|[0-9]|1[0-9]|2[0-3]):([0-9]|[0-5][0-9]):([0-9]|[0-5][0-9])$/g)) errors.startDate = "Start date must be a valid datetime in YYYY-MM-DD HH:MM:SS format"
        let prevDate = new Date(startDate.slice(0, 10));
        prevDate.setDate(prevDate.getDate() - 1);
        let postDate = new Date(startDate.slice(0, 10));
        postDate.setDate(postDate.getDate() + 1);
        query.where.startDate = { [Op.between]: [prevDate, postDate] };
    }
    if (JSON.stringify(errors) !== '{}') {
        err.errors = errors;
        next(err);
    }
    else {
        const events = await Event.findAll(query);
        res.json({ "Events": formatEvents(events) });
    }
});

// Get all Events by groupId in Groups

// Get details of Event by eventId
router.get("/:eventId", async (req, res) => {
    const event = await Event.findByPk(req.params.eventId, {
        include: [
        {
          association: "Attendees"
        },
        {
          association: "EventImages",
          attributes: {
            exclude: ["createdAt", "updatedAt"]
          }
        },
        {
          association: "Group",
          attributes: ["id", "name", "city", "state"],
        },
        {
          association: "Venue",
          attributes: ["id", "city", "state"],
        }
    ]});
    if (!event) return _eventNotFound(res);
    else {
        let resBody = event.dataValues;
        resBody.numAttending = getAttendees(resBody);
        delete resBody.Attendees;
        res.json(resBody);
    }
});

// Create event based on groupId in Groups

// Add Image to Event based on eventId
router.post("/:eventId/images", [requireAuth, handleValidationErrors], async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;
    const { url, preview } = req.body;
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Attendees"
            },
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            }
        ]
    });
    if (!event) {
        return _eventNotFound(res);
    }
    else {
        if (isAttending(user, event) || isCoHost(user, event.Group)) {
            const newImage = await event.createEventImage({
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

// Edit Event by eventId
router.put("/:eventId", requireAuth, async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;
    const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Attendees"
            },
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            }
        ]
    });
    if (!event) return _eventNotFound(res);
    else {
        if (isAttending(user, event) || isCoHost(user, event.Group)) {
            if (name) event.name = name;
            if (type) event.type = type;
            if (capacity) event.capacity = capacity;
            if (price) event.price = price;
            if (description) event.description = description;
            if (startDate) event.startDate = startDate;
            if (endDate) event.endDate = endDate;
            // if there is venueId input
            // check if venue exists
            if (parseInt(venueId)) {
                const venue = await Venue.findByPk(venueId);
                if (!venue) {
                    res.statusCode = 404;
                    return res.json({ message: "Venue couldn't be found" });
                }
                else event.venueId = venueId;
            }
            await event.save({validate: true});
            res.statusCode = 201;
            let resBody = event.dataValues;
            delete resBody.Attendees;
            delete resBody.Group;
            res.json(resBody);
        }
        else return _authorizationError(res);
    }
});

// Delete event on eventId
router.delete("/:eventId", requireAuth, async (req, res) => {
    const { user } = req;
    const event = await Event.findByPk(req.params.eventId, {
        include: [
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            }
        ]
    });
    if (!event) {
        return _eventNotFound(res);
    } else {
        if (isOrganizer(user, event.Group) || isCoHost(user, event.Group)) {
            await event.destroy();
            res.json({ message: "Successfully deleted"});
        }
        else return _authorizationError(res);
    }
});

// Get all Attendees of Event by eventId
router.get("/:eventId/attendees", async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            },
            {
                association: "Attendees",
                through: {
                    attributes: ["status"]
                }
            }
        ]
    });
    if (!event) return _eventNotFound(res);
    if (isOrganizer(user, event.Group) || isCoHost(user, event.Group)) return res.json({ "Attendees": event.Attendees });
    else {
        return res.json({ "Attendees": event.Attendees.filter(user => user.Attendance.status !== "pending") });
    }
});

// Request to attend Event based on eventId
router.post("/:eventId/attendance", requireAuth, async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            },
            {
                association: "Attendees",
                through: {
                    attributes: ["status"]
                }
            }
        ]
    });
    if (!event) return _eventNotFound(res);
    const attendance = await Attendance.findOne({
        where: {
            userId: user.id,
            eventId: eventId
        }
    });
    if (!attendance) {
        if (isMember(user, event.Group)) {
            const newAttendance = await Attendance.create(
                {
                    status: "pending",
                    userId: user.id,
                    eventId: event.id
                }
            );
            return res.json(newAttendance);
        }
        else return _authorizationError(res);
    }
    else {
        if (attendance.status == "pending") {
            res.statusCode = 400;
            return res.json({ "message": "Attendance has already been requested" });
        }
        else {
            res.statusCode = 400;
            return res.json({ "message": "User is already an attendee of the event" });
        }
    }
});

// Change status of attendance by eventId
const validateEditAttendance = [
    check('userId')
        .isInt({ min: 1 })
        .withMessage("Invalid userId"),
    check('status')
        .isIn(["pending", "attending", "waitlist"])
        .withMessage("Invalid status"),
    handleValidationErrors
];
router.put("/:eventId/attendance", [requireAuth, validateEditAttendance], async (req, res) => {
    const { user } = req;
    const { eventId } = req.params;
    const { userId, status } = req.body;
    if (status == "pending") {
        res.statusCode = 400;
        return res.json({
            "message": "Bad Request",
            "errors": {
              "status" : "Cannot change an attendance status to pending"
            }
        });
    };
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            },
            {
                association: "Attendees",
                through: {
                    attributes: ["status"]
                }
            }
        ]
    });
    if (!event) return _eventNotFound(res);
    const attendee = await User.findByPk(userId);
    if (!attendee) return _userNotFound(res);
    const attendance = await Attendance.findOne({
        where: {
            userId: userId,
            eventId: eventId
        }
    });
    if (!attendance) return _attendanceNotFound(res);
    else {
        if (isCoHost(user, event.Group) || isOrganizer(user, event.Group)) {
            attendance.status = status;
            await attendance.save();
            return res.json(attendance);
        }
        else return _authorizationError(res);
    }
});

// Delete attendance
router.delete("/:eventId/attendance/:userId", requireAuth, async (req, res) => {
    const { user } = req;
    const { eventId, userId } = req.params;
    const attendee = await User.findByPk(userId);
    if (!attendee) return _userNotFound(res);
    const event = await Event.findByPk(eventId, {
        include: [
            {
                association: "Group",
                include: {
                    association: "Members"
                }
            },
            {
                association: "Attendees",
                through: {
                    attributes: ["status"]
                }
            }
        ]
    });
    if (!event) return _eventNotFound(res);
    const attendance = await Attendance.findOne({
        where: {
            userId: userId,
            eventId: eventId
        }
    });
    if (!attendance) return _attendanceNotFound(res);
    else {
        if (isCoHost(user, event.Group) || user.id == attendance.userId ) {
            await attendance.destroy();
            res.json({ "message": "Successfully deleted attendance from event" });
        }
        else return _authorizationError(res);
    }
});

module.exports = router;
