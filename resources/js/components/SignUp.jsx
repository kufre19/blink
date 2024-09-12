import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import TbdService from '../services/TbdService';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      // Create DID
      const did = await TbdService.createDid();
      // console.log(did);

      // Get Verifiable Credential
      const verifiableCredential = await TbdService.getVerifiableCredential(formData.name, did);
      // console.log(verifiableCredential);

      // Send registration data to Laravel backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.confirmPassword,
          did,
          verifiable_credential: verifiableCredential,
          encrypted_private_key: "nothing for now"
        }),
      });

      if (response.ok) {
        // Registration successful, redirect to dashboard or login
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration. Please try again.');
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
                    <h3>Sign Up Now</h3>
                    <p>Use the form below to create your account.</p>
                  </div>
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="input-head">
                    <div className="form-group input-group">
                      <label><i className="lni lni-user"></i></label>
                      <input className="form-control" type="text" name="name" placeholder="Your name" required onChange={handleChange} />
                    </div>
                    <div className="form-group input-group">
                      <label><i className="lni lni-envelope"></i></label>
                      <input className="form-control" type="email" name="email" placeholder="Your email" required onChange={handleChange} />
                    </div>
                    <div className="form-group input-group">
                      <label><i className="lni lni-lock-alt"></i></label>
                      <input className="form-control" type="password" name="password" placeholder="Your password" required onChange={handleChange} />
                    </div>
                    <div className="form-group input-group">
                      <label><i className="lni lni-lock-alt"></i></label>
                      <input className="form-control" type="password" name="confirmPassword" placeholder="Confirm password" required onChange={handleChange} />
                    </div>
                  </div>
                  <div className="button">
                    <button className="btn" type="submit">Create Account</button>
                  </div>
                  <h4 className="create-account">Already have an account? <Link to="/signin">Sign In</Link></h4>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;