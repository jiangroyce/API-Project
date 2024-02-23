import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom';
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

const router = createBrowserRouter([
  {
    element: <Layout />,
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
        element: <GroupDetailPage />
      },
      {
        path: 'groups/:id/edit',
        element: <UpdateGroupPage />
      },
      {
        path: 'groups/:id/events/new',
        element: <CreateEventPage />
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
