import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteEvent } from '../../store/events';
import "./DeleteEventModal.css"

function DeleteEventModal({event}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const { id } = useParams();
  const groupId = event.groupId;

  const confirmDelete = (e) => {
    e.preventDefault();
    return dispatch(deleteEvent(id))
      .then(closeModal)
      .then(navigate(`/groups/${groupId}`))
  };

  return (
    <div className='delete-group-modal'>
      <h1>Confirm Delete</h1>
      <h2>Are you sure you want to remove this event?</h2>
      <button className="delete-button" onClick={confirmDelete}>Yes (Delete Event)</button>
      <button className="no-button" onClick={closeModal}>No (Keep Event)</button>
    </div>
  );
}

export default DeleteEventModal;
