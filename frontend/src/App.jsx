import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/index.jsx';
import SelectRole from './pages/start/SelectRole.jsx';
import CustomerRegister from './pages/register/CustomerRegister.jsx';
import ButcherRegister from './pages/register/ButcherRegister.jsx';
import AdminRegister from './pages/register/AdminRegister.jsx';
import CustomerLogin from './pages/login/CustomerLogin.jsx';
import ButcherLogin from './pages/login/ButcherLogin.jsx';
import CustomerForgotPassword from './pages/login/CustomerForgotPassword.jsx';
import ButcherForgotPassword from './pages/login/ButcherForgotPassword.jsx';
import CustomerResetPassword from './pages/login/CustomerResetPassword.jsx';
import ButcherResetPassword from './pages/login/ButcherResetPassword.jsx';
import CustomerDashboard from './pages/dashboard/CustomerDashboard.jsx';
import ButcherDashboard from './pages/dashboard/ButcherDashboard.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/start" element={<SelectRole />} />
        <Route path="/register/customer" element={<CustomerRegister />} />
        <Route path="/register/butcher" element={<ButcherRegister />} />
        <Route path="/register/admin" element={<AdminRegister />} />
        <Route path="/login/customer" element={<CustomerLogin />} />
        <Route path="/login/butcher" element={<ButcherLogin />} />
        <Route path="/forgot-password/customer" element={<CustomerForgotPassword />} />
        <Route path="/forgot-password/butcher" element={<ButcherForgotPassword />} />
        <Route path="/reset-password/customer" element={<CustomerResetPassword />} />
        <Route path="/reset-password/butcher" element={<ButcherResetPassword />} />
        <Route path="/dashboard/customer" element={<CustomerDashboard />} />
        <Route path="/dashboard/butcher" element={<ButcherDashboard />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
