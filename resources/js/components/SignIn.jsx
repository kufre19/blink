import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');


    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('encryptedPrivateKey', data.encrypted_private_key);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="account-login section">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 offset-lg-3 col-md-10 offset-md-1 col-12">
              <form className="card login-form inner-content" onSubmit={handleSubmit}>
                <div className="card-body">
                  <div className="title">
                    <h3>Sign In Now</h3>
                    <p>Sign in to your account to continue.</p>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="input-head">
                    <div className="form-group input-group">
                      <label><i className="lni lni-envelope"></i></label>
                      <input className="form-control" type="email" name="email" placeholder="Your email" required onChange={handleChange} />
                    </div>
                    <div className="form-group input-group">
                      <label><i className="lni lni-lock-alt"></i></label>
                      <input className="form-control" type="password" name="password" placeholder="Your password" required onChange={handleChange} />
                    </div>
                  </div>
                  <div className="button">
                    <button className="btn" type="submit">Sign In</button>
                  </div>
                  <h4 className="create-account">Don't have an account? <Link to="/signup">Sign Up</Link></h4>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;