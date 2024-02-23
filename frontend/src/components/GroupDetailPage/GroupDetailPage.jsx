import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import "./GroupDetailPage.css"
import EventDetails from "../EventDetails/EventDetails";
import { getEvents, getGroup } from "../../store/groups";
import { useEffect, useState } from "react";
import DeleteGroupButton from "../DeleteGroupModal/DeleteGroupButton";

function GroupDetailPage () {
    const sessionUser = useSelector(state => state.session.user);
    const dispatch = useDispatch();
    const { id } = useParams();
    const group = useSelector((state) => state.groups[id]);
    const navigate = useNavigate();

    const [eventFilter, setEventFilter] = useState({});
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        dispatch(getGroup(id))
            .then(dispatch(getEvents(id)))
            .then(splitEvents(group?.Events))
            .then(setIsLoaded(true));
    }, [id, dispatch]);

    function splitEvents(events) {
        const results = {};
        if (events)
        {
            results.upcoming = events.filter(event => new Date(event.startDate) >= Date.now()).sort((eventA, eventB) => {
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
            results.past = events.filter(event => new Date(event.endDate) < Date.now());
        }
        return setEventFilter(results);
    }

    return (
    <div className="group-details-container">
    <nav className="bread-crumb"><NavLink to="/groups">{"< Groups"}</NavLink></nav>
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
                        {sessionUser?.id != group.organizerId ? <button className="join-group" onClick={() => window.alert("Feature Coming Soon")}>Join this group</button> : null}
                        {sessionUser?.id == group.organizerId ?
                            <div className="organizer-actions">
                                <button onClick={() => navigate("events/new")}>Create Event</button>
                                <button onClick={() => navigate("edit")}>Update</button>
                                <DeleteGroupButton />
                            </div> :
                        null}
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
                    {
                        eventFilter.upcoming?.length > 0 ?
                        (<div className="events-container">
                            <h1>Upcoming Events {"(" + eventFilter.upcoming?.length + ")"}</h1>
                            {eventFilter.upcoming?.map((event) => <EventDetails key={event.id} eventId={event.id} />)}
                        </div>) :
                        (<div className="events-container">
                            <h1>No Upcoming Events</h1>
                        </div>)
                    }
                    {
                        eventFilter.past?.length > 0 ?
                        (
                            <div className="events-container">
                            <h1>Past Events {"(" + eventFilter.past?.length + ")"}</h1>
                            {eventFilter.past?.map((event) => <EventDetails key={event.id} eventId={event.id} />)}
                        </div>
                        ) :
                        null
                    }
                </div>
            </>
        }
        </div>
    )
}

export default GroupDetailPage;
