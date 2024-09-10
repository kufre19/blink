import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
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