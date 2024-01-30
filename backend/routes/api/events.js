const express = require('express');
const { User, Group, GroupImage, Venue, Event, EventImage } = require('../../db/models');
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

module.exports = router;
