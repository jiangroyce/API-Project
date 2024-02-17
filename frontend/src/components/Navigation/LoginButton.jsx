import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';

function LoginButton() {

    return (
      <>
        <OpenModalMenuItem
            itemText="Log In"
            modalComponent={<LoginFormModal />}
        />
      </>
    );
  }

  export default LoginButton;
