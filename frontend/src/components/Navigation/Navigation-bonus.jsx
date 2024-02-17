import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton-bonus';
import LoginButton from './LoginButton';
import SignUpButton from './SignupButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul>
      <li>
        <NavLink id="home-button" to="/">Meetup</NavLink>
      </li>
      { isLoaded &&
      sessionUser ?
      (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      ) :
      (
        <div id="not-logged-in">
          <li><LoginButton /></li>
          <li><SignUpButton /></li>
        </div>
      )
      }
    </ul>
  );
}

export default Navigation;
