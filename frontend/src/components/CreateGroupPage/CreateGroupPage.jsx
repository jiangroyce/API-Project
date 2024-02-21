import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../../store/groups";

function CreateGroupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({})
    const [location, setLocation] = useState("");
    const updateLocation = (e) => setLocation(e.target.value);
    const [name, setName] = useState("");
    const updateName = (e) => setName(e.target.value);
    const [description, setDescription] = useState("");
    const updateDescription = (e) => setDescription(e.target.value);
    const [type, setType] = useState("In person");
    const updateType = (e) => setType(e.target.value);
    const [isPrivate, setPrivate] = useState("false");
    const updatePrivate = (e) => setPrivate(e.target.value);
    const [url, setUrl] = useState("");
    const updateUrl = (e) => setUrl(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const payload = {
            name: name,
            about: description,
            type: type,
            private: isPrivate == "true" ? true : false,
            city: location.split(", ")[0],
            state: location.split(", ")[1],
            url: url
        };
        try {
            const newGroup = await dispatch(createGroup(payload));
            navigate(`/groups/${newGroup.id}`);
        } catch(e) {
            const res = await e.json();
            setErrors(res.errors)
        };
    };

    return (
        <>
        <h1>Start a New Group</h1>
        <h2>We&apos;ll walk you through a few steps to build your local community</h2>
        <form className="create-group-form" onSubmit={handleSubmit}>
            <label>First, set your groups&apos;s location.
            <p>Meetup groups meet locally, in person and online. We&apos;ll connect you to people in your area, and more can join you online.</p>
            <input
                type="text"
                placeholder="City, STATE"
                required
                value={location}
                onChange={updateLocation} />
            </label>
            <div className="errors">{errors.city}</div>
            <div className="errors">{errors.state}</div>
            <label>What will your group&apos;s name be?
            <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
            <input
                type="text"
                placeholder="What is your group name?"
                required
                value={name}
                onChange={updateName} />
            </label>
            <div className="errors">{errors.name}</div>
            <label>Describe the purpose of your group.
            <p>People will see this when we promote your group, but you'll be able to add to it later, too. 1. What's the purpose of the group? 2. Who should join? 3. What will you do at your events?</p>
            <textarea
                placeholder="Please write at least 50 characters"
                required
                value={description}
                onChange={updateDescription} />
            </label>
            <div className="errors">{errors.about}</div>
            <label>Is this an in-person or online group?
            <select value={type} onChange={updateType}>
                <option>In person</option>
                <option>Online</option>
            </select>
            </label>
            <div className="errors">{errors.type}</div>
            <label>Is this group private or public?
            <select value={isPrivate} onChange={updatePrivate}>
                <option value={false}>Public</option>
                <option value={true}>Private</option>
            </select>
            </label>
            <div className="errors">{errors.private}</div>
            <label>Please add an image URL for your group below:
            <input
                type="text"
                placeholder="Image Url"
                required
                value={url}
                onChange={updateUrl} />
            </label>
            <div className="errors">{errors.url}</div>
            <button>Create Group</button>
        </form>
        </>
    )
}

export default CreateGroupPage;
