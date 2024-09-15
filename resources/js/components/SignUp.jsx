import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import TbdService from '../services/TbdService';
import Alert from './Alert';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    portableDid: ''
  });
  const [isImporting, setIsImporting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ show: false, message: '', type: '' });

    if (formData.password !== formData.confirmPassword) {
      setAlert({ show: true, message: "Passwords don't match", type: 'danger' });
      return;
    }

    try {
      let didString, portableDid, encryptedPortableDid;

      if (isImporting) {
        // Import existing portable DID
        portableDid = await TbdService.importPortableDid(formData.portableDid);
        didString = portableDid.uri;
      } else {
        // Create new DID
        const result = await TbdService.createDid();
        didString = result.didString;
        portableDid = result.portableDid;
      }

      encryptedPortableDid = TbdService.encryptPortableDid(portableDid, formData.password);
      const verifiableCredential = await TbdService.getVerifiableCredential(formData.name, didString);

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
          did: didString,
          verifiable_credential: verifiableCredential,
          encrypted_private_key: "nothing for now",
          encrypted_portable_did: encryptedPortableDid
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('encryptedPortableDid', encryptedPortableDid);
        navigate('/dashboard');
      } else {
        setAlert({ show: true, message: data.message || 'Registration failed', type: 'danger' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({ show: true, message: 'An error occurred during registration. Please try again.', type: 'danger' });
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
                    <h3>{isImporting ? 'Import Existing DID' : 'Sign Up Now'}</h3>
                    <p>{isImporting ? 'Import your existing DID to create an account.' : 'Use the form below to create your account.'}</p>
                  </div>
                  {alert.show && <Alert message={alert.message} type={alert.type} onClose={() => setAlert({ ...alert, show: false })} />}
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
                    {isImporting && (
                      <div className="form-group input-group">
                        <label><i className="lni lni-key"></i></label>
                        <textarea
                          className="form-control"
                          name="portableDid"
                          placeholder="Paste your portable DID here"
                          required
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>
                  <div className="button">
                    <button className="btn" type="submit">{isImporting ? 'Import DID and Register' : 'Create Account'}</button>
                  </div>
                  <div className="alt-option">
                    <button type="button" className="btn btn-link" onClick={() => setIsImporting(!isImporting)}>
                      {isImporting ? 'Create New Account Instead' : 'Import Existing DID'}
                    </button>
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