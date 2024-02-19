import { csrfFetch } from './csrf.js';

const LOAD_GROUPS = "groups/LOAD_GROUPS";
const LOAD_EVENTS = "groups/LOAD_EVENTS";

const loadGroups = groups => ({
    type: LOAD_GROUPS,
    groups
});

const loadEvents = events => ({
    type: LOAD_EVENTS,
    events
});

export const getGroups = () => async dispatch => {
    const response = await csrfFetch("/api/groups");
    if (response.ok) {
        const groups = await response.json();
        dispatch(loadGroups(groups.Groups));
    }
};

export const getEventsForGroup = (group) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${group.id}/events`);
    if (response.ok) {
        const events = await response.json();
        dispatch(loadEvents(events.Events))
    }
}

const initialState = {
    list: []
};

function groupsReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_GROUPS: {
            const allGroups = {};
            action.groups.forEach(group => {
                allGroups[group.id] = group;
            });
            return {
                ...allGroups,
                ...state,
                list: action.groups
            }
        }
        case LOAD_EVENTS: {
            const newState = { ...state };
            const groupId = action.events[0].groupId;
            newState[groupId] = { ...newState[groupId], events: action.events}
            return newState;
        }
        default:
            return state
    }
}

export default groupsReducer
