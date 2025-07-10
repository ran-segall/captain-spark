import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Intro from './pages/onboarding/Intro';
import ParentName from './pages/onboarding/ParentName';
import KidName from './pages/onboarding/KidName';
import KidAge from './pages/onboarding/KidAge';
import Email from './pages/onboarding/Email';
import PersonalWelcome from './pages/onboarding/PersonalWelcome';
import Ready from './pages/onboarding/Ready';
import ReadyToStart from './pages/onboarding/ReadyToStart';
import StartLater from './pages/onboarding/StartLater';
import Confirm from './pages/onboarding/Confirm';
import LessonIntro from './pages/onboarding/LessonIntro';
import LessonBuilder from './pages/LessonBuilder';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Landing Page Is Coming Soon</div>} />
        <Route path="/onboarding" element={<Intro />} />
        <Route path="/onboarding/parent-name" element={<ParentName />} />
        <Route path="/onboarding/kid-name" element={<KidName />} />
        <Route path="/onboarding/kid-age" element={<KidAge />} />
        <Route path="/onboarding/email" element={<Email />} />
        <Route path="/onboarding/personal-welcome" element={<PersonalWelcome />} />
        <Route path="/onboarding/ready" element={<Ready />} />
        <Route path="/onboarding/ready-to-start" element={<ReadyToStart />} />
        <Route path="/onboarding/start-later" element={<StartLater />} />
        <Route path="/onboarding/confirm" element={<Confirm />} />
        <Route path="/onboarding/lesson-intro" element={<LessonIntro />} />
        <Route path="/lesson-builder" element={<LessonBuilder />} />
      </Routes>
    </Router>
  );
}

export default App;
