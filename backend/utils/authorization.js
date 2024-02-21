
// Authorization Functions
function _authorizationError(res) {
    res.statusCode = 403;
    return res.json({ message: "Forbidden" });
}
function isOrganizer(user, group) {
    return group.organizerId == user?.id;
}
function isCoHost(user, group) {
    let coHosts = group.Members.filter(member => member.Membership.status === "co-host").map(member => member.id);
    return coHosts.includes(user?.id) || isOrganizer(user, group);
}
function isMember(user, group) {
    let members = group.Members.filter(member => member.Membership.status != "pending").map(member => member.id)
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
