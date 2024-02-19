function GroupDetails({group}) {
    return (
        <div className="group-details">
            <img src={group.previewImage} />
            <div className="group-info">
                <h1>{group.name}</h1>
                <h2>{group.city}, {group.state}</h2>
                <p>{group.about}</p>
                <div className="members-type">
                    {group.numMembers} members · {group.private ? "Private" : "Public"}
                </div>
            </div>
        </div>
    )
}

export default GroupDetails;
