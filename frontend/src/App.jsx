import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/index.jsx';
import SelectRole from './pages/start/SelectRole.jsx';
import CustomerRegister from './pages/register/CustomerRegister.jsx';
import ButcherRegister from './pages/register/ButcherRegister.jsx';
import AdminRegister from './pages/register/AdminRegister.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<SelectRole />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/butcher" element={<ButcherRegister />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
