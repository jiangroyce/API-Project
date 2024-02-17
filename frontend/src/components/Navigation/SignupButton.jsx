import OpenModalMenuItem from './OpenModalMenuItem';
import SignupFormModal from '../SignupFormModal';

function SignUpButton() {

    return (
      <>
        <OpenModalMenuItem
            itemText="Sign Up"
            modalComponent={<SignupFormModal />}
        />
      </>
    );
  }

  export default SignUpButton;
