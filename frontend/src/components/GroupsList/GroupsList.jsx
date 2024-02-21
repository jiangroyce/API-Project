import { useEffect } from "react";
import GroupEventsNav from "../Navigation/GroupEventsNav";
import GroupDetails from "../GroupDetails";
import { useDispatch, useSelector } from "react-redux";
import { getGroups } from "../../store/groups";
import "./GroupsList.css";

function GroupsList() {
    const dispatch = useDispatch();
    const allGroups = useSelector(state => state.groups);
    useEffect(() => {
        dispatch(getGroups())
    }, [dispatch]);

    return (
        <main>
            <GroupEventsNav itemText={"Groups"}/>
            {allGroups.list.map((group) => <GroupDetails key={group.id} group={group} />)}
        </main>
    )
}

export default GroupsList;
