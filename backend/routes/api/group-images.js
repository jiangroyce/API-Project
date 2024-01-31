const express = require('express');
const { Group, GroupImage } = require('../../db/models');
const { requireAuth } = require("../../utils/auth.js");
const { _authorizationError, isOrganizer, isCoHost } = require('../../utils/authorization.js');
const { _groupImageNotFound } = require("../../utils/errors.js");

const router = express.Router();

// Delete image for group
router.delete("/:imageId", requireAuth, async (req, res) => {
    const { user } = req;
    const image = await GroupImage.findByPk(req.params.imageId);
    if (!image) return _groupImageNotFound(res);
    const group = await Group.findByPk(image.groupId, { include: { association: "Members" } });
    if (isCoHost(user, group) || isOrganizer(user, group)) {
        await image.destroy();
        return res.json({ message: "Successfully deleted" });
    }
    else return _authorizationError(res);
});

module.exports = router;
