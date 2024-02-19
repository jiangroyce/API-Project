import OpenModalMenuItem from './OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';

function SignUpButton({itemText}) {

    return (
      <>
        <OpenModalMenuItem
            itemText={itemText}
            modalComponent={<SignupFormModal />}
        />
      </>
    );
  }

  export default SignUpButton;
