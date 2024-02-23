import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const checkPassword = (e) => {
    setConfirmPassword(e.target.value)
    if (e.target.value != password) setErrors({confirmPassword: "Passwords must match"});
    else setErrors({confirmPassword: null});
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors({});
      return dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data?.errors) {
            setErrors(data.errors);
          }
        });
    }
  };

  return (
    <div className='signup-modal'>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p className="errors">* {errors.email}</p>}
        <label>
          Username
          <input
            type="text"
            placeholder='more than 4 characters'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p className="errors">* {errors.username}</p>}
        <label>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && <p className="errors">* {errors.firstName}</p>}
        <label>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && <p className="errors">* {errors.lastName}</p>}
        <label>
          Password
          <input
            type="password"
            placeholder='more than 6 characters'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p className="errors">* {errors.password}</p>}
        <label>
          Confirm Password
          <input
            type="password"
            placeholder='case sensitive'
            value={confirmPassword}
            onChange={checkPassword}
            required
          />
        </label>
        {errors.confirmPassword && <p className="errors">* {errors.confirmPassword}</p>}
        <button type="submit" disabled={!email.length || !firstName.length || !lastName.length || username.length < 4 || password.length < 6 || confirmPassword !== password}>Sign Up</button>
      </form>
    </div>
  );
}

export default SignupFormModal;
