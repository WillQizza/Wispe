import './App.css';
import './variables.css';

import '@fontsource/inria-sans';

import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Homepage } from './routes/Homepage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
      </Routes>
    </Router>
  );
}
