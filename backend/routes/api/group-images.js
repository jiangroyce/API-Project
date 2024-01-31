const express = require('express');
const { User, Group, GroupImage, Venue, Event, EventImage, Attendance } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');

const router = express.Router();

function _imageNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Group Image couldn't be found" });
}

// Delete image for group
router.delete("/:imageId", requireAuth, async (req, res) => {
    const { user } = req;
    const image = await GroupImage.findByPk(req.params.imageId);
    if (!image) return _imageNotFound(res);
    const group = await Group.findByPk(image.groupId, { include: { association: "Members" } });
    if (isCoHost(user, group) || isOrganizer(user, group)) {
        await image.destroy();
        return res.json({ message: "Successfully deleted" });
    }
    else return _authorizationError(res);
});

module.exports = router;
