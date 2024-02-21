const express = require('express');
const { User, Venue, Event, Attendance } = require('../../db/models');
const { requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors, validateEditAttendance, validateEditEvent, validateQueryParams } = require('../../utils/validation.js');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');
const { _userNotFound, _eventNotFound, _attendanceNotFound } = require("../../utils/errors.js");
const { getAttendees, formatEvents, formatAttendances, removeUpdatedAt, getEventImage } = require('../../utils/formatting.js');
const { Op } = require("sequelize");

const router = express.Router();

// Get All Events
router.get("/", validateQueryParams, async (req, res, next) => {
    let query = {
        attributes: {
            exclude: ["capacity", "price"]
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
    // page and size options
    const page = req.query.page === undefined ? 1 : parseInt(req.query.page);
    const size = req.query.size === undefined ? 20 : parseInt(req.query.size);
    if (page >= 1 && size >= 1) {
        query.limit = Math.min(size, 20)
        query.offset = Math.min(size, 20) * (Math.min(page, 10) - 1);
    };

    // name, type, startDate
    const { name, type, startDate } = req.query;
    if (name) query.where.name = { [Op.like]: "%"+name+"%" };
    if (type) query.where.type = { [Op.eq]: type };
    if (startDate) {
        let prevDate = new Date(startDate.slice(0, 10));
        prevDate.setDate(prevDate.getDate() - 1);
        let postDate = new Date(startDate.slice(0, 10));
        postDate.setDate(postDate.getDate() + 1);
        query.where.startDate = { [Op.between]: [prevDate, postDate] };
    }
    const events = await Event.findAll(query);
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
          attributes: ["id", "name", "city", "state", "private"],
        },
        {
          association: "Venue",
          attributes: ["id", "city", "state", "address", "lat", "lng"],
        }
    ]});
    if (!event) return _eventNotFound(res);
    else {
        let resBody = event.dataValues;
        resBody.numAttending = getAttendees(resBody);
        resBody.previewImage = getEventImage(resBody);
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
router.put("/:eventId", [requireAuth, validateEditEvent], async (req, res) => {
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
        if (isCoHost(user, event.Group)) {
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
    if (isCoHost(user, event.Group)) return res.json({ "Attendees": event.Attendees });
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
            return res.json(formatAttendances(newAttendance));
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
        if (isCoHost(user, event.Group)) {
            attendance.status = status;
            await attendance.save();
            return res.json(removeUpdatedAt(attendance));
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
        if (isOrganizer(user, event.Group) || user.id == attendance.userId ) {
            await attendance.destroy();
            res.json({ "message": "Successfully deleted attendance from event" });
        }
        else return _authorizationError(res);
    }
});

module.exports = router;
