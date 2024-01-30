const express = require('express');
const { User, Group, GroupImage, Venue } = require('../../db/models');
const { check } = require('express-validator');
const { setTokenCookie, restoreUser, requireAuth } = require("../../utils/auth.js");
const { handleValidationErrors } = require('../../utils/validation');
const { _authorizationError, isOrganizer, isCoHost, isMember, isAttending } = require('../../utils/authorization.js');

const router = express.Router();

// Helper Functions
function _venueNotFound(res) {
    res.statusCode = 404;
    res.json({ message: "Venue couldn't be found" });
}

// Endpoints:

// Get Venue for groupId in groups
// Create Venue for groupId in groups

// Edit Venue by venueId
router.put("/:venueId", requireAuth, async (req, res) => {
    const { user } = req;
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;
    const venue = await Venue.findByPk(venueId);
    if (!venue) return _venueNotFound(res);
    else {
        let group = await Group.findByPk(venue.groupId);
        if (isOrganizer(user, group) || isCoHost(user, group)) {
            if (address) venue.address = address;
            if (city) venue.city = city;
            if (state) venue.state = state;
            if (lat) venue.lat = lat;
            if (lng) venue.lng = lng;
            await venue.save({validate: true});
            res.statusCode = 201;
            res.json(venue);
        }
        else return _authorizationError(res);
    }
});


module.exports = router;

/*
Todo:
make custom messages for validation errors in venue.js

Issues:
Sequelize Validator showing error 500 insteat of 400

*/
