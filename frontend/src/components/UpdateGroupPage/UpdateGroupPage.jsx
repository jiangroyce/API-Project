import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { updateGroup } from "../../store/groups";

function UpdateGroupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const group = useSelector(state => state.groups[id]);
    console.log(group);
    const [errors, setErrors] = useState({});
    const [location, setLocation] = useState(`${group.city}, ${group.state}`);
    const updateLocation = (e) => setLocation(e.target.value);
    const [name, setName] = useState(group.name);
    const updateName = (e) => setName(e.target.value);
    const [description, setDescription] = useState(group.about);
    const updateDescription = (e) => setDescription(e.target.value);
    const [type, setType] = useState(group.type);
    const updateType = (e) => setType(e.target.value);
    const [isPrivate, setPrivate] = useState(group.private);
    const updatePrivate = (e) => setPrivate(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const payload = {
            id: id,
            name: name,
            about: description,
            type: type,
            private: isPrivate,
            city: location.split(", ")[0],
            state: location.split(", ")[1]
        };
        try {
            const newGroup = await dispatch(updateGroup(payload));
            navigate(`/groups/${newGroup.id}`);
        } catch (e) {
            const res = await e.json();
            setErrors({...res.errors})
        }
    };

    return (
        <div className="create-group-page">
            <div className="create-group-title">
                <h1>UPDATE YOUR GROUP&apos;S INFORMATION</h1>
                <h2>We&apos;ll walk you through a few steps to update your group&apos;s information</h2>
            </div>
            <form className="create-group-form" onSubmit={handleSubmit}>
                <div className="form-location">
                    <label>First, set your groups&apos;s location.
                    <p>Meetup groups meet locally, in person and online. We&apos;ll connect you to people in your area, and more can join you online.</p>
                    <input
                        type="text"
                        placeholder="City, STATE"
                        value={location}
                        onChange={updateLocation} />
                    </label>
                    <div className="errors">{errors.city || errors.state? "Location is required": null}</div>
                </div>
                <div className="form-name">
                    <label>What will your group&apos;s name be?
                    <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
                    <input
                        type="text"
                        placeholder="What is your group name?"
                        value={name}
                        onChange={updateName} />
                    </label>
                    <div className="errors">{errors.name ? (name.length > 60 ? errors.name : "Name is required") : null}</div>
                </div>
                <div className="form-about">
                    <label>Describe the purpose of your group.
                    <p>People will see this when we promote your group, but you&apos;ll be able to add to it later, too. 1. What&apos;s the purpose of the group? 2. Who should join? 3. What will you do at your events?</p>
                    <textarea
                        placeholder="Please write at least 50 characters"
                        value={description}
                        onChange={updateDescription} />
                    </label>
                    <div className="errors">{errors.about}</div>
                </div>
                <div className="form-final-steps">
                    <label>Final Steps...</label>
                    <label><span>Is this an in-person or online group?</span>
                        <select value={type} onChange={updateType}>
                            <option value="" disabled>(select one)</option>
                            <option>In person</option>
                            <option>Online</option>
                        </select>
                    </label>
                    <div className="errors">{errors.type ? "Group Type is required" : null}</div>
                    <label><span>Is this group private or public?</span>
                    <select value={isPrivate} onChange={updatePrivate}>
                        <option value="" disabled>(select one)</option>
                        <option value={false}>Public</option>
                        <option value={true}>Private</option>
                    </select>
                    </label>
                    <div className="errors">{errors.private ? "Visibility Type is required" : null}</div>
                </div>
                <button>Create Group</button>
            </form>
        </div>
    )
}

export default UpdateGroupPage;
