import React from 'react';
import { MdOutlineDoubleArrow } from 'react-icons/md';
import './About.css';

const About = () => {
  return (
    <div>
      <div className="about-us-container">
        <div className="about-us-header">
          <h2 className="about-heading">
            About Us
          </h2>
        </div>
        <div className="about-us-content">
          <div className="about-info">
            <p className="info-heading">
              What is CAMI?
            </p>
            <p className="info-text">
              CAMI is a Coaching Assistant for Medical Information (CAMI) developerd by experts in health but also in those other crucial parts of life such as education and services in your community.
            </p>
            <button className='btn info-btn '>Show More <span><MdOutlineDoubleArrow /></span></button>
          </div>
          <div className="about-info">
            <p className="info-heading">
              What’s special about CAMI?
            </p>
            <p className="info-text">
              Unlike you searching the web for answers to your questions alone, CAMI uses its training with experts to provide you with trusted resources.
            </p>
            <button className='btn info-btn '>Show More <span><MdOutlineDoubleArrow /></span> </button>
          </div>
          <div className="about-info">
            <p className="info-heading">
              What can I ask CAMI about?
            </p>
            <p className="info-text">
              CAMI focuses currently on developmental differences affecting children but also adults. In the future we would like to train CAMI to answer other questions.
            </p>
            <p className="info-text">
              You can ask CAMI for general information about specific conditions such as autism, learning disability, ADHD. You can also be specific if for instance your child has been diagnosed with a specific genetic condition, say Fragile X syndrome, chromosome 16p deletion etc.

            </p>
            <button className='btn info-btn'>Show More <span><MdOutlineDoubleArrow /> </span> </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default About;