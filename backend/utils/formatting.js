// Group Formatting Functions
function getNumMembers(group) {
    return group.Members.filter(user => user.Membership.status != "pending").length;
};
function getGroupImage(group) {
    let trueImages = group.GroupImages.filter(image => image.preview == true);
    if (trueImages.length) return trueImages.url;
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
    if (trueImages.length) return trueImages.url;
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

module.exports = {
    getNumMembers, getGroupImage, formatGroups, getAttendees, getEventImage, formatEvents
};
