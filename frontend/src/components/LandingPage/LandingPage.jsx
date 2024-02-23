import { useSelector } from 'react-redux';
import SignUpButton from '../Navigation/SignupButton';
import "./LandingPage.css"
import { Link } from 'react-router-dom';

function LandingPage() {
    const sessionUser = useSelector(state => state.session.user);
    return (
        <main>
            <div className="landing-banner">
                <div className="intro-banner">
                    <h1>The people platform -- Where interests become friendships</h1>
                    <p>Whatever your interest, from hiking and reading to networking and skill sharing, there are thousands of people who share it on Meetup. Events are happening every day—sign up to join the fun.</p>
                </div>
                <div className="intro-picture">
                    <img src="https://secure.meetupstatic.com/next/images/indexPage/irl_event.svg?w=384"></img>
                </div>
            </div>
            <div className="explanation">
                <h2>How Meetup works</h2>
                <p>People use Meetup to meet new people, learn new things, find support, get out of their comfort zones, and pursue their passions, together. Membership is free.</p>
            </div>
            <div className="functionality">
                <div className="function-card">
                    <img src="https://www.meetup.com/_next/image/?url=%2Fimages%2FindexPage%2Fjoin%2Fjoin_meetup.webp&w=384&q=75"></img>
                    <Link to="/groups">See all groups</Link>
                    <p>Discover local groups and connect with locals over shared interests.</p>
                </div>
                <div className="function-card">
                    <img src="https://www.meetup.com/_next/image/?url=%2Fimages%2FindexPage%2Fjoin%2Fjoin_meetup.webp&w=384&q=75"></img>
                    <Link to="/events">Find an event</Link>
                    <p>See who&apos;s hosting local events for all the things you love.</p>
                </div>
                <div className="function-card">
                    <img src="https://www.meetup.com/_next/image/?url=%2Fimages%2FindexPage%2Fjoin%2Fjoin_meetup.webp&w=384&q=75"></img>
                    {sessionUser ? <Link to="/groups/new">Start a new group</Link> : <p id="new-group">Start a new group</p>}
                    <p>Create your own Meetup group, and draw from a community of millions.</p>
                </div>
            </div>
            {!sessionUser && <div id='sign-up'><SignUpButton itemText={"Join Meetup"}/></div>}
        </main>
    )
}

export default LandingPage;
