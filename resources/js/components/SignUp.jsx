import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
                    <h3>Sign Up Now</h3>
                    <p>Use the form below to create your account.</p>
                  </div>
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