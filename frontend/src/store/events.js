import { csrfFetch } from './csrf.js';

const LOAD_EVENTS = "events/LOAD_EVENTS";
const GET_HOST = "events/GET_HOST";
const ADD_EVENT = "events/ADD_EVENT";
const DELETE_EVENT = "events/DELETE_EVENT";

const loadEvents = events => ({
    type: LOAD_EVENTS,
    events
});

const loadEvent = event => ({
    type: GET_HOST,
    event
});

const addEvent = event => ({
    type: ADD_EVENT,
    event
});

const removeEvent = id => ({
    type: DELETE_EVENT,
    id
})

export const getEvents = () => async dispatch => {
    const response = await csrfFetch(`/api/events`);
    if (response.ok) {
        const events = await response.json();
        dispatch(loadEvents(events.Events));
    }
};

export const getEvent = (id) => async dispatch => {
    const response = await csrfFetch(`/api/events/${id}`);
    if (response.ok) {
        const event = await response.json();
        const attendees = await csrfFetch(`/api/events/${id}/attendees`);
        if (attendees.ok) {
            const result = await attendees.json();
            const host = result.Attendees.filter((user) => user.Attendance.status === "host")[0];
            event.host = host;
            dispatch(loadEvent(event));
        }
    }
};

export const createEvent = (payload) => async dispatch => {
    const response = await csrfFetch(`/api/groups/${payload.groupId}/events`,
    {
        method: "POST",
        body: JSON.stringify(payload)
    });
    if (response.ok) {
        const newEvent = await response.json();
        const imgRes = await csrfFetch(`/api/events/${newEvent.id}/images`,
        {
            method: "POST",
            body: JSON.stringify({url: payload.url, preview: true})
        });
        if (imgRes.ok) {
            const newImg = await imgRes.json();
            newEvent.previewImage = newImg.url;
            dispatch(addEvent(newEvent));
            return newEvent;
        }
    }
};

export const deleteEvent = (id) => async dispatch => {
    const response = await csrfFetch(`/api/events/${id}`, {
        method: "DELETE"
    });
    if (response.ok) dispatch(removeEvent(id));
}

const sortList = (list) => {
    return list.sort((eventA, eventB) => {
        const now = new Date();
        const dateA = new Date(eventA.startDate);
        const dateB = new Date(eventB.startDate);
        const d1 = Math.abs(dateA - now);
        const d2 = Math.abs(dateB - now);
        if (dateA < now && dateB < now) return 0;
        else if (dateA < now) return 1;
        else if (dateB < now) return -1
        else return d1 - d2;
    });
  };

const initialState = {
    list: []
};

function eventsReducer(state = initialState, action) {
    switch (action.type) {
        case LOAD_EVENTS: {
            const allEvents = {};
            action.events.forEach(event => {
                allEvents[event.id] = event;
            });
            return {
                ...allEvents,
                ...state,
                list: sortList(action.events)
            }
        }
        case GET_HOST: {
            const eventId = action.event.id;
            const newState = { ...state };
            newState[eventId] = {...newState[eventId], ...action.event};
            return newState;
        }
        case ADD_EVENT: {
            const eventId = action.event.id;
            const newState = { ...state };
            newState[eventId] = {...newState[eventId], ...action.event};
            const eventList = newState.list;
            newState.list.push(action.event);
            newState.list = sortList(eventList);
            return newState;
        }
        case DELETE_EVENT: {
            const newState = {...state};
            delete newState[action.id];
            newState.list = sortList(newState.list.filter(event => event.id != action.id))
            return newState;
        }
        default:
            return state
    }
}

export default eventsReducer
