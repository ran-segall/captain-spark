import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Intro from './pages/onboarding/Intro';
import ParentName from './pages/onboarding/ParentName';
import KidName from './pages/onboarding/KidName';
import KidAge from './pages/onboarding/KidAge';
import Email from './pages/onboarding/Email';
import Ready from './pages/onboarding/Ready';
import Confirm from './pages/onboarding/Confirm';
import VideoIntro from './pages/onboarding/VideoIntro';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Landing Page Is Coming Soon</div>} />
        <Route path="/onboarding" element={<Intro />} />
        <Route path="/onboarding/video-intro" element={<VideoIntro />} />
        <Route path="/onboarding/parent-name" element={<ParentName />} />
        <Route path="/onboarding/kid-name" element={<KidName />} />
        <Route path="/onboarding/kid-age" element={<KidAge />} />
        <Route path="/onboarding/email" element={<Email />} />
        <Route path="/onboarding/ready" element={<Ready />} />
        <Route path="/onboarding/confirm" element={<Confirm />} />
      </Routes>
    </Router>
  );
}

export default App;
