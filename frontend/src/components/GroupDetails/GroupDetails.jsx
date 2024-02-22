import "./GroupDetails.css"

import { useNavigate } from "react-router-dom";

function GroupDetails({group}) {
    const navigate = useNavigate();
    return (
        <div className="group-details" onClick={async () => {
            navigate(`/groups/${group.id}`);
        }}>
            <img src={group.previewImage} />
            <div className="group-info">
                <h1>{group.name}</h1>
                <h2>{group.city}, {group.state}</h2>
                <p>{group.about}</p>
                <div className="members-type">
                    {group.Events?.length} {group.Events?.length === 1? "Event": "Events"} · {group.private ? "Private" : "Public"}
                </div>
            </div>
        </div>
    )
}

export default GroupDetails;
