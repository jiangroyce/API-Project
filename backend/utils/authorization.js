
// Authorization Functions
function _authorizationError(res) {
    res.statusCode = 403;
    res.json({ message: "Forbidden" });
}
function isOrganizer(user, group) {
    return group.organizerId == user.id;
}
function isCoHost(user, group) {
    let coHosts = group.Members.filter(member => member.Membership.status === "co-host").map(member => member.id);
    return coHosts.includes(user.id);
}
function isMember(user, group) {
    let members = group.Members.map(member => member.id)
    return members.includes(user.id);
}
function isAttending(user, event) {
    let attendees = event.Attendees.filter(attendee => attendee.Attendance.status == "attending").map(attendee => attendee.id);
    return attendees.includes(user.id)
}

module.exports = {
    _authorizationError,
    isOrganizer,
    isCoHost,
    isMember,
    isAttending
};
