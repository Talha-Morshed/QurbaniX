import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/index.jsx';
import SelectRole from './pages/start/SelectRole.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<SelectRole />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
