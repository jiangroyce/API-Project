const express = require('express');
const { User, Group, GroupImage, Venue } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');

const router = express.Router();

function _venueNotFound(res) {
    res.statusCode = 404;
    res.json({ message: "Venue couldn't be found" });
}
router.put("/:venueId", requireAuth, async (req, res) => {
    const venue = await Venue.findByPk(req.params.venueId);
    if (!venue) return _venueNotFound(res);
    // finish
});


module.exports = router;

/*
Todo:
make custom messages for validation errors in venue.js
finish put /:venueId


*/
