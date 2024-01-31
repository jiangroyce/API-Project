const express = require('express');
const { Group, Venue } = require('../../db/models');
const { requireAuth } = require("../../utils/auth.js");
const { validateEditVenue } = require('../../utils/validation.js');
const { _authorizationError, isOrganizer, isCoHost } = require('../../utils/authorization.js');
const { _venueNotFound } = require("../../utils/errors.js");

const router = express.Router();

// Get Venue for groupId in groups
// Create Venue for groupId in groups

// Edit Venue by venueId
router.put("/:venueId", [requireAuth, validateEditVenue], async (req, res) => {
    const { user } = req;
    const { venueId } = req.params;
    const { address, city, state, lat, lng } = req.body;
    const venue = await Venue.findByPk(venueId);
    if (!venue) return _venueNotFound(res);
    else {
        let group = await Group.findByPk(venue.groupId, { include: { association: "Members" } });
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
