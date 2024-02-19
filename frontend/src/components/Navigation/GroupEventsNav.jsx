import { NavLink } from "react-router-dom";
import "./GroupEventsNav.css"

function GroupEventsNav({itemText}) {
    return (
        <div className="GroupEventsNav">
            <nav>
                <NavLink to="/events">Events</NavLink>
                <NavLink to="/groups">Groups</NavLink>
            </nav>
            <p>{itemText} in Meetup</p>
        </div>
    )
}

export default GroupEventsNav;
