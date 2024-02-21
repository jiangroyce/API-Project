import { csrfFetch } from './csrf.js';

const LOAD_EVENTS = "events/LOAD_EVENTS";
const LOAD_EVENT = "events/LOAD_EVENT";

const loadEvents = events => ({
    type: LOAD_EVENTS,
    events
});

const loadEvent = event => ({
    type: LOAD_EVENT,
    event
});

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
                list: action.events
            }
        }
        case LOAD_EVENT: {
            const newState = { ...state };
            const eventId = action.event.id;
            newState[eventId] = {...newState[eventId], ...action.event};
            return newState;
        }
        default:
            return state
    }
}

export default eventsReducer
