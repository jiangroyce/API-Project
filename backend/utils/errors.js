// Not Found Errors
function _groupNotFound(res) {
    res.statusCode = 404;
    res.json({message: "Group couldn't be found"});
};
function _userNotFound(res) {
    res.statusCode = 404;
    res.json({message: "User couldn't be found"});
}
function _membershipNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Membership between the user and the group does not exist" })
}
function _eventNotFound(res) {
    res.statusCode = 404;
    res.json({message: "Event couldn't be found"});
}
function _attendanceNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Attendance between the user and the event does not exist" })
}
function _eventImageNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Event Image couldn't be found" });
}
function _groupImageNotFound(res) {
    res.statusCode = 404;
    return res.json({ "message": "Group Image couldn't be found" });
}
function _venueNotFound(res) {
    res.statusCode = 404;
    res.json({ message: "Venue couldn't be found" });
}

module.exports = {
    _groupNotFound, _userNotFound, _membershipNotFound, _eventImageNotFound, _eventNotFound, _attendanceNotFound, _venueNotFound, _groupImageNotFound
};
