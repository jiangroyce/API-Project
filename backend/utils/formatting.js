// Group Formatting Functions
function getNumMembers(group) {
    return group.Members.filter(user => user.Membership.status != "pending").length;
};
function getGroupImage(group) {
    let trueImages = group.GroupImages.filter(image => image.preview == true);
    if (trueImages.length) return trueImages[0].url;
    else return null;
};
function formatGroups(groups) {
    groups.forEach((group) => {
        let newGroup = group.dataValues;
        newGroup.numMembers = getNumMembers(newGroup);
        newGroup.previewImage = getGroupImage(newGroup);
        delete newGroup.Members;
        delete newGroup.GroupImages;
        group.dataValues = newGroup
    });
    return groups;
};
// Event Formatting Functions
function getAttendees(event) {
    return event.Attendees.filter(user => user.Attendance.status == "attending").length;
};
function getEventImage(event) {
    let trueImages = event.EventImages.filter(image => image.preview == true);
    if (trueImages.length) return trueImages[0].url;
    else return null;
};
function formatEvents(events) {
    events.forEach((event) => {
        let newEvent = event.dataValues;
        newEvent.numAttending = getAttendees(newEvent);
        newEvent.previewImage = getEventImage(newEvent);
        delete newEvent.Attendees;
        delete newEvent.EventImages;
        event.dataValues = newEvent
    });
    return events;
};
function formatMemberships(membership) {
    let resBody = membership.dataValues;
    delete resBody.groupId;
    delete resBody.createdAt;
    delete resBody.updatedAt;
    resBody.memberId = resBody.userId;
    delete resBody.userId;
    delete resBody.id;
    return resBody;
};
function formatAttendances(attendance) {
    let resBody = attendance.dataValues;
    delete resBody.eventId;
    delete resBody.createdAt;
    delete resBody.updatedAt;
    delete resBody.id;
    return resBody;
};
function removeUpdatedAt(instance) {
    let resBody = instance.dataValues;
    delete resBody.updatedAt;
    delete resBody.createdAt;
    return resBody
}
module.exports = {
    getNumMembers, getGroupImage, formatGroups, getAttendees, getEventImage, formatEvents, formatMemberships, formatAttendances, removeUpdatedAt
};
