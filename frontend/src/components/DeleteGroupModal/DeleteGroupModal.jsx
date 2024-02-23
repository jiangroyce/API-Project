import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteGroup } from '../../store/groups';
import "./DeleteGroupModal.css"

function DeleteGroupModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { closeModal } = useModal();
  const { id } = useParams();

  const confirmDelete = (e) => {
    e.preventDefault();
    return dispatch(deleteGroup(id))
      .then(closeModal)
      .then(navigate("/groups"))
  };

  return (
    <div className='delete-group-modal'>
      <h1>Confirm Delete</h1>
      <h2>Are you sure you want to remove this group?</h2>
      <button className="delete-button" onClick={confirmDelete}>Yes (Delete Group)</button>
      <button className="no-button" onClick={closeModal}>No (Keep Group)</button>
    </div>
  );
}

export default DeleteGroupModal;
