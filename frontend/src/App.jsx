import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
// import LoginFormPage from './components/LoginFormPage';
// import SignupFormPage from './components/SignupFormPage';
import Navigation from './components/Navigation/Navigation-bonus';
import LandingPage from './components/LandingPage';
import * as sessionActions from './store/session';
import { getGroups } from './store/groups';
import { Modal } from './context/Modal';
import GroupsList from './components/GroupsList';
import EventsList from './components/EventsList';
import GroupDetailPage from './components/GroupDetailPage';
import EventDetailPage from './components/EventDetailPage';
import CreateGroupPage from './components/CreateGroupPage';
import CreateEventPage from './components/CreateEventPage';
import UpdateGroupPage from './components/UpdateGroupPage';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser())
      .then(dispatch(getGroups()))
      // .then(dispatch(getEvents()))
      .then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Modal/>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

export function ErrorPage({home}) {
  const navigate = useNavigate();
  return (
    <div className='error-page' onClick={()=>navigate("/")}>
      {home && <Layout />}
      <h1>Oops, something went wrong. Click anywhere to return to home.</h1>
    </div>
  )
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorPage home={true}/>,
    children: [
      {
        path: '/',
        element: <LandingPage />
      },
      {
        path: 'groups',
        element: <GroupsList />
      },
      {
        path: 'groups/:id',
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <GroupDetailPage />
          },
          {
            path: 'edit',
            element: <UpdateGroupPage />
          },
          {
            path: 'events/new',
            element: <CreateEventPage />
          },
        ]
      },
      {
        path: 'groups/new',
        element: <CreateGroupPage />
      },
      {
        path: 'events',
        element: <EventsList />
      },
      {
        path: 'events/:id',
        element: <EventDetailPage />
      },
      {
        path: "*",
        element: <ErrorPage home={false} />
      }
    ]
  }
]);

function App() {
  return (
      <RouterProvider router={router} />
  );
}

export default App;
