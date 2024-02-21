import { useEffect, useState } from "react";
import GroupEventsNav from "../Navigation/GroupEventsNav";
import { useDispatch, useSelector } from "react-redux";
import { getEvents } from "../../store/events";
import EventDetails from "../EventDetails/EventDetails";

function EventsList() {
    const dispatch = useDispatch();
    const allEvents = useSelector(state => state.events);
    const [isLoaded, setIsLoaded] = useState(false)
    useEffect(() => {
        dispatch(getEvents()).then(setIsLoaded(true))
    }, [dispatch])
    return (
        <>
        {isLoaded && (
            <>
            <GroupEventsNav itemText={"Events"}/>
            {allEvents.list.map(event => <EventDetails key={event.id} eventId={event.id} />)}
            </>
        )}
         </>

    )
}

export default EventsList;
