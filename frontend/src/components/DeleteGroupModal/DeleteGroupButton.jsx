import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DeleteGroupModal from './DeleteGroupModal';

function DeleteGroupButton() {

    return (
      <button>
        <OpenModalMenuItem
            itemText="Delete"
            modalComponent={<DeleteGroupModal />}
        />
      </button>
    );
  }

  export default DeleteGroupButton;
