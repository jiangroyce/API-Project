const express = require('express');
const { User, Group, GroupImage, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');

const router = express.Router();

function _imageNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Event Image couldn't be found" });
}

// Delete image for group
router.delete("/:imageId", requireAuth, async (req, res) => {
    const { user } = req;
    const image = await EventImage.findByPk(req.params.imageId);
    if (!image) return _imageNotFound(res);
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
