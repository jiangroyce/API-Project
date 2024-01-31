const express = require('express');
const { Event, EventImage } = require('../../db/models');
const { requireAuth } = require("../../utils/auth.js");
const { _authorizationError, isOrganizer, isCoHost } = require('../../utils/authorization.js');
const { _eventImageNotFound } = require("../../utils/errors.js");

const router = express.Router();

// Delete image for group
router.delete("/:imageId", requireAuth, async (req, res) => {
    const { user } = req;
    const image = await EventImage.findByPk(req.params.imageId);
    if (!image) return _eventImageNotFound(res);
    const event = await Event.findByPk(image.eventId, {
        include: {
            association: "Group",
            include: {
                association: "Members"
            }
        }
    })
    if (isCoHost(user, event.Group) || isOrganizer(user, event.Group)) {
        await image.destroy();
        return res.json({ message: "Successfully deleted" });
    }
    else return _authorizationError(res);
});

module.exports = router;
