import "./EventDetails.css"

import { useNavigate } from "react-router-dom";
import { getEvent } from "../../store/events";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

function EventDetails({eventId}){
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        dispatch(getEvent(eventId)).then(setIsLoaded(true))
    }, [eventId, dispatch]);
    const event = useSelector(state => state.events[eventId]);
    return (
        <div className="event-details" onClick={async () => {
            navigate(`/events/${eventId}`)
        }}>
            { isLoaded && event &&
            (
                <>
                <div className="event-details-banner">
                    <img src={event.previewImage} />
                    <div className="event-details-info">
                        <h4>{new Date(event.startDate).toISOString().split('T')[0] + "·" + new Date(event.startDate).toString().split(' ')[4]}</h4>
                        <h3>{event.name}</h3>
                        <h5>{event.Venue.city}, {event.Venue.state}</h5>
                    </div>
                </div>
                <div className="event-about">
                    <p>{event.description}</p>
                </div>
                </>
            )
            }
        </div>
    )
};

export default EventDetails;
