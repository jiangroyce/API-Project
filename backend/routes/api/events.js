const express = require('express');
const { User, Group, GroupImage, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');

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
router.get("/", async (req, res) => {
    const events = await Event.findAll({
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
        }
    ]});
    res.json({ "Events": formatEvents(events) });
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
