import { useDispatch, useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import "./EventDetailPage.css"
import { getEvent } from "../../store/events";
import { useEffect, useState } from "react";
import { FaRegClock, FaDollarSign, FaMapPin } from "react-icons/fa6";
import GroupDetails from "../GroupDetails";
import { getGroup } from "../../store/groups";
import DeleteEventButton from "../DeleteEventModal/DeleteEventButton";

function EventDetailPage () {
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    const { id } = useParams();
    const event = useSelector((state) => state.events[id]);
    const group = useSelector((state) => state.groups[event?.groupId]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        dispatch(getEvent(id))
        .then(dispatch(getGroup(event.groupId)))
        .then(setIsLoaded(true))
    }, [id, dispatch]);

    return (
        <>
        {isLoaded && (
            <div className="event-details-container">
            <nav className="bread-crumb">
                <NavLink to="/events">{"< Events"}</NavLink>
                <h1>{event.name}</h1>
                <h2>Hosted by: {event.host?.firstName + " " + event.host?.lastName}</h2>
            </nav>
            <div className="event-banner">
                <img src={event.previewImage} alt={event.name} />
                <div className="event-info-container">
                    <GroupDetails group={group} />
                    <div className="event-info">
                        <div className="event-time">
                            <FaRegClock />
                            <div className="time-info">
                                <p>START <span className="time">{new Date(event.startDate).toISOString().split('T')[0] + " · " + new Date(event.startDate).toString().split(' ')[4]}</span></p>
                                <p>END <span className="time"> {new Date(event.endDate).toISOString().split('T')[0] + " · " + new Date(event.endDate).toString().split(' ')[4]}</span></p>
                            </div>
                        </div>
                        <div className="event-price">
                            <FaDollarSign />
                            <div className="price-info">{ event.price === 0 ? "FREE": `$ ${event.price}` }</div>
                        </div>
                        <div className="event-type">
                            <FaMapPin />
                            <div className="type-info">{event.type}</div>
                        </div>
                    </div>
                    {sessionUser?.id == event.host?.id ? (
                        <div className="host-actions">
                            <button onClick={()=> window.alert("Feature coming soon")}>Update</button>
                            <DeleteEventButton event={event}/>
                        </div>
                    ) : null }

                </div>
            </div>
            <div className="event-description">
                <h2>Details</h2>
                <p>{event.description}</p>
            </div>
        </div>
        )}
        </>

    )
}

export default EventDetailPage;
