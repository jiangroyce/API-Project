import { csrfFetch } from './csrf.js';

const LOAD_GROUPS = "groups/LOAD_GROUPS";
const LOAD_GROUP = "groups/LOAD_GROUP";
const LOAD_EVENTS = "groups/LOAD_EVENTS";
const DELETE_GROUP = "groups/DELETE_GROUP";

const loadGroups = groups => ({
    type: LOAD_GROUPS,
    groups
});

const loadGroup = group => ({
    type: LOAD_GROUP,
    group
});

const loadEvents = ({events, id}) => ({
    type: LOAD_EVENTS,
    id,
    events
});

const removeGroup = id => ({
    type: DELETE_GROUP,
    id
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
        dispatch(loadEvents({events: events.Events, id: groupId}));
    }
};

export const createGroup = (payload) => async dispatch => {
    const response = await csrfFetch(`/api/groups`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const newGroup = await response.json();
        const imgRes = await csrfFetch(`/api/groups/${newGroup.id}/images`, {
            method: "POST",
            body: JSON.stringify({url: payload.url, preview: true})
        });
        if (imgRes.ok) {
            const newImg = await imgRes.json();
            newGroup.previewImage = newImg.url;
            const venueRes = await csrfFetch(`/api/groups/${newGroup.id}/venues`, {
                method: "POST",
                body: JSON.stringify({
                    address: newGroup.name + " base",
                    city: newGroup.city,
                    state: newGroup.state,
                    lat: 0,
                    lng: 0
                })
            });
            if (venueRes.ok) {
                dispatch(loadGroup({...newGroup, Events: []}));
                return newGroup;
            }
        }
    }
};

export const updateGroup = (payload) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${payload.id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const newGroup = await response.json();
        dispatch(loadGroup(newGroup));
        return newGroup;
    }
};

export const deleteGroup = (id) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${id}`, {
        method: "DELETE"
    });
    if (response.ok) {
        dispatch(removeGroup(id));
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
            newState[action.id].Events = action.events;
            return newState;
        }
        case DELETE_GROUP: {
            const newState = {...state};
            delete newState[action.id];
            return {
                ...newState,
                list: newState.list.filter(group => group.id != action.id)
            };
        }
        default:
            return state
    }
}

export default groupsReducer
