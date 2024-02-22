import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams} from "react-router-dom";
import "./CreateEventPage.css";
import { createEvent } from "../../store/events";

function CreateEventPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {id} = useParams();
    const group = useSelector(state => state.groups[id]);

    // Controlled Form
    const [errors, setErrors] = useState({});
    const [name, setName] = useState("");
    const updateName = (e) => setName(e.target.value);
    const [type, setType] = useState("");
    const updateType = (e) => setType(e.target.value);
    const [isPrivate, setPrivate] = useState("");
    const updatePrivate = (e) => setPrivate(e.target.value);
    const [capacity, setCapacity] = useState("");
    const updateCapacity = (e) => setCapacity(e.target.value);
    const [price, setPrice] = useState("");
    const updatePrice = (e) => setPrice(e.target.value);
    const [startDate, setStartDate] = useState("");
    const updateStartDate = (e) => setStartDate(new Date(e.target.value).toISOString().split("T").join(" ").split(".")[0]);
    const [endDate, setEndDate] = useState("");
    const updateEndDate = (e) => setEndDate(new Date(e.target.value).toISOString().split("T").join(" ").split(".")[0]);
    const [url, setUrl] = useState("");
    const updateUrl = (e) => setUrl(e.target.value);
    const [description, setDescription] = useState("");
    const updateDescription = (e) => setDescription(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const payload = {
            groupId: id,
            venueId: group?.Venues[0]?.id || 1,
            name,
            type,
            capacity,
            price,
            description,
            startDate,
            endDate,
            url
        };
        try {
            const newEvent = await dispatch(createEvent(payload));
            navigate(`/events/${newEvent.id}`);
        } catch(e) {
            console.log(e);
            const regex = /\.(jpg|png|jpeg)$/;
            const res = await e.json();
            setErrors({...res.errors, url: regex.test(url) ? null : "Image URL must end in .png, .jpg, or .jpeg", private: isPrivate === "" ? "Visibility is required" : null})
        };
    };

    return (
        <div className="create-event-page">
            <div className="create-event-title">
                <h1>Create an event for <span>{group?.name}</span></h1>
            </div>
            <form className="create-event-form" onSubmit={handleSubmit}>
                <div className="event-name">
                    <label>What is the name of your event?
                        <input
                            type="text"
                            placeholder="Event Name"
                            value={name}
                            onChange={(updateName)} />
                    </label>
                    <div className="errors">{errors.name}</div>
                </div>
                <div className="event-type">
                    <label>Is this an in person or online event?
                        <select value={type} onChange={(updateType)}>
                            <option value="" disabled>(select one)</option>
                            <option>In person</option>
                            <option>Online</option>
                        </select>
                    </label>
                    <div className="errors">{errors.type ? "Event Type is required" : null}</div>
                </div>
                <div className="event-private">
                    <label>Is this event private or public?
                        <select value={isPrivate} onChange={updatePrivate}>
                            <option value="" disabled>(select one)</option>
                            <option value={false}>Public</option>
                            <option value={true}>Private</option>
                        </select>
                    </label>
                    <div className="errors">{errors.private}</div>
                </div>
                <div className="event-capacity">
                    <label>What is the capacity of your event?
                        <input
                                type="text"
                                placeholder="0"
                                value={capacity}
                                onChange={(updateCapacity)} />
                    </label>
                    <div className="errors">{errors.capacity}</div>
                </div>
                <div className="event-price">
                    <label>What is the price of your event?
                        <input
                            type="text"
                            placeholder="0"
                            value={price}
                            onChange={(updatePrice)} />
                    </label>
                    <div className="errors">{errors.price}</div>
                </div>
                <div className="event-startdate">
                    <label>When does your event start?
                        <input
                            type="datetime-local"
                            placeholder="MM/DD/YYYY HH:mm AM"
                            value={startDate}
                            onChange={(updateStartDate)} />
                    </label>
                    <div className="errors">{errors.startDate || errors.startDateinFuture}</div>
                </div>
                <div className="event-enddate">
                    <label>When does your event end?
                        <input
                            type="datetime-local"
                            placeholder="MM/DD/YYYY HH:mm AM"
                            value={endDate}
                            onChange={(updateEndDate)} />
                    </label>
                    <div className="errors">{errors.endDate || errors.endDateAfterStartDate}</div>
                </div>
                <div className="event-url">
                    <label><span>Please add an image URL for your event below:</span>
                        <input
                            type="text"
                            placeholder="Image Url"
                            value={url}
                            onChange={updateUrl} />
                        </label>
                <div className="errors">{errors.url}</div>
                </div>
                <div className="event-about">
                    <label>Please describe your event:
                        <textarea
                            placeholder="Please include at least 30 characters."
                            value={description}
                            onChange={(updateDescription)} />
                    </label>
                    <div className="errors">{errors.description}</div>
                </div>
                <button>Create Event</button>
            </form>
        </div>
    )
}

export default CreateEventPage;
