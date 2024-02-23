import OpenModalMenuItem from '../Navigation/OpenModalMenuItem';
import DeleteEventModal from './DeleteEventModal';

function DeleteEventButton({event}) {

    return (
      <button>
        <OpenModalMenuItem
            itemText="Delete"
            modalComponent={<DeleteEventModal event={event}/>}
        />
      </button>
    );
  }

  export default DeleteEventButton;
