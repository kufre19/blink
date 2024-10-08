import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';

const Home = () => {
  return (
    <>
      <Navbar />
      <section className="hero-area">
        <img className="hero-shape" src="/assets/images/hero/hero-shape.svg" alt="#" />
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-md-12 col-12">
              <div className="hero-content">
                <h4 className="wow fadeInUp" data-wow-delay=".2s">Fast, Secure, and Borderless Transactions</h4>
                <h1 className="wow fadeInUp" data-wow-delay=".4s">
                  Simplify Your
                  <span>
                    <img className="text-shape" src="/assets/images/hero/text-shape.svg" alt="#" />
                    Global Payments
                  </span>
                </h1>
                <p className="wow fadeInUp" data-wow-delay=".6s">
                  Instantly convert currencies, create invoices, and manage<br /> international transactions with ease.
                </p>
                <div className="button wow fadeInUp" data-wow-delay=".8s">
                  <Link to="/signup" className="btn">Get Started</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-12">
              <div className="hero-image">
               
                <img className="main-image" src="/assets/images/hero/home2-bg.png" alt="#" />
                <img className="h2-move-1" src="/assets/images/hero/h2-bit-l.png" alt="#" />
                <img className="h2-move-2" src="/assets/images/hero/h2-bit-m.png" alt="#" />
                <img className="h2-move-3" src="/assets/images/hero/h2-bit-s.png" alt="#" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;