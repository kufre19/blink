import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Navbar from './components/Navbar';
import PrivateRoute from './PrivateRoute';
import Dashboard from './components/Dashboard';
import InvoiceDetailsComponent from './components/InvoiceDetailsComponent';
import ProfilePage from './components/ProfilePage';

const App = () => {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/invoices" element={<Dashboard />} /> */}
          <Route path="/invoices/:id" element={<InvoiceDetailsComponent />} />
          <Route path="/profile" element={<ProfilePage />} />

        </Route>
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);