import "./EventDetails.css"
function EventDetails({event}){

    return (
        <div className="event-details">
            <div className="event-details-banner">
                <img src={event.previewImage} />
                <div className="event-details-info">
                    <h3>{event.name}</h3>
                    <h4>{event.Venue.city}, {event.Venue.state}</h4>
                </div>
            </div>
            <div className="event-about">
                <p>{event.description}</p>
            </div>
        </div>
    )
};

export default EventDetails;
