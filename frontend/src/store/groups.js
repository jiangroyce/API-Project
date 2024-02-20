import { csrfFetch } from './csrf.js';

const LOAD_GROUPS = "groups/LOAD_GROUPS";
const LOAD_GROUP = "groups/LOAD_GROUP";
const LOAD_EVENTS = "groups/LOAD_EVENTS";

const loadGroups = groups => ({
    type: LOAD_GROUPS,
    groups
});

const loadGroup = group => ({
    type: LOAD_GROUP,
    group
});

const loadEvents = events => ({
    type: LOAD_EVENTS,
    events
})

export const getGroups = () => async dispatch => {
    const response = await csrfFetch("/api/groups");
    if (response.ok) {
        const groups = await response.json();
        dispatch(loadGroups(groups.Groups));
    }
};

export const getGroup = (groupId) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${groupId}`);
    if (response.ok) {
        const group = await response.json();
        dispatch(loadGroup(group))
    }
};

export const getEvents = (groupId) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${groupId}/events`);
    if (response.ok) {
        const events = await response.json();
        dispatch(loadEvents(events.Events));
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
        case LOAD_GROUP: {
            const newState = { ...state };
            const groupId = action.group.id;
            newState[groupId] = {...newState[groupId], ...action.group};
            return newState;
        }
        case LOAD_EVENTS: {
            const newState = { ...state };
            const groupId = action.events[0].groupId;
            newState[groupId].Events = action.events;
            return newState;
        }
        default:
            return state
    }
}

export default groupsReducer
