import { useDispatch, useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import "./GroupDetailPage.css"
import EventDetails from "../EventDetails/EventDetails";
import { getEvents, getGroup } from "../../store/groups";
import { useEffect, useState } from "react";

function GroupDetailPage () {
    const dispatch = useDispatch();
    const { id } = useParams();
    const group = useSelector((state) => state.groups[id]);

    const [eventFilter, setEventFilter] = useState({});
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        dispatch(getGroup(group.id))
            .then(dispatch(getEvents(group.id)))
            .then(splitEvents(group.Events))
            .then(setIsLoaded(true));
    }, [id, dispatch]);

    function splitEvents(events) {
        const results = {};
        results.upcoming = events.filter(event => new Date(event.startDate) >= Date.now());
        results.past = events.filter(event => new Date(event.endDate) < Date.now());
        return setEventFilter(results);
    }

    return (
    <div className="group-details-container">
    <nav><NavLink to="/groups">{"< Groups"}</NavLink></nav>
        { isLoaded &&
            <>
                <div className="group-info-banner">
                    <img src={group.previewImage} alt={group.name} />
                    <div className="group-info-container">
                        <div className="group-info">
                            <h1>{group.name}</h1>
                            <h2>{group.city + ", " + group.state}</h2>
                            <p>{group.Events.length} {group.Events.length === 1? "Event": "Events"} · {group.private ? "Private" : "Public"}</p>
                            <p>Organized by: {group.Organizer?.firstName + " " + group.Organizer?.lastName}</p>
                        </div>
                        <button onClick={() => window.alert("Feature Coming Soon")}>Join this group</button>
                    </div>
                </div>
                <div className="group-events-container">
                    <div className="organizer-info">
                        <h1>Organizer</h1>
                        <h2>{group.Organizer?.firstName + " " + group.Organizer?.lastName}</h2>
                    </div>
                    <div className="about-info">
                        <h1>What we&apos;re about</h1>
                        <p>{group.about}</p>
                    </div>
                    <div className="events-container">
                        <h1>Upcoming Events {"(" + eventFilter.upcoming?.length + ")"}</h1>
                        {eventFilter.upcoming?.map((event) => <EventDetails key={event.id} eventId={event.id} />)}
                    </div>
                    <div className="events-container">
                        <h1>Past Events {"(" + eventFilter.past?.length + ")"}</h1>
                        {eventFilter.past?.map((event) => <EventDetails key={event.id} eventId={event.id} />)}
                    </div>
                </div>
            </>
        }
        </div>
    )
}

export default GroupDetailPage;
