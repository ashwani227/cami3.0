import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { Notify } from '../../helper/Notify';

import useAuthContext from '../../hooks/useAuthContext';
import * as Yup from 'yup';

const DisplayingErrorMessagesSchema = Yup.object().shape({

  email: Yup.string().email('Invalid email').required('Email Required'),
  password: Yup.string()
    .required('Password Required')
    .min(8, 'Password must have at least 8 characters'),
  confirmPassword: Yup.string().required('Retype password')
    .test('passwords-match', 'Passwords must match', function (value) {
      return this.parent.password === value
    })
});

const Signup = () => {
  const { isLogin, authenticate } = useAuthContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLogin) {
      navigate('/')
    }
  }, [isLogin, navigate])

  return (
    <div>
      <div className='header'>
        <h2>Sign Up</h2>
      </div>
      <div className='mt-3 container-fluid container'>
        <h5 className='fw-bold'>Benefits of signing up</h5>
        <ul>
          <li>Share resources with your friends and family.</li>
          <li>Save resources to view later.</li>
          <li>Filter resources using your own custom filters.</li>
          <li>Save your progress so that you don't have to answer the same questions.</li>
        </ul>
      </div>
      <div className='container-fluid container mt-4 login-container'>
        <Formik
          initialValues={{ email: '', password: '', confirm: '' }}
          validationSchema={DisplayingErrorMessagesSchema}
          onSubmit={(values, { setSubmitting }) => {
            const { confirm, ...data } = values;
            authenticate('register', data).then(response => {

              setSubmitting(true)
              const { data } = response || {};
              if (data.email) {

                setSubmitting(false)
                Notify('Sign up Successfully. Please Sign in to continue', 'success');
                navigate('/login');

              } else if (data.message) {

                if (data.message.toString().toLowerCase().includes("please check your email")) {
                  Notify(data.message, 'info');
                } else {
                  Notify(data.message, 'error')
                }

              } else {
                Notify("Something went wrong. Please try again.", 'error');
              }

              setSubmitting(false)

            }).catch(error => {
              console.error(error);
              setSubmitting(false)
            })

          }}
        >
          {({
            isSubmitting,
          }) => (
            <Form className='auth-form'>
              <label htmlFor='email' className='d-block mb-2'>Email</label>
              <div className='input-container'>
                <Field type="email" name="email" id='email' className='input' />
              </div>
              <ErrorMessage name="email" component="div" className='error text-danger mt-2' />
              <label htmlFor='email' className='d-block mt-2 mb-2'>Password</label>
              <div className='input-container'>
                <Field type="password" name="password" id='password' className='input' />
              </div>
              <ErrorMessage name="password" component="div" className='error text-danger mt-2' />
              <label htmlFor='confirm' className='d-block mt-2 mb-2'>Confirm Password</label>
              <div className='input-container'>
                <Field type="password" name="confirmPassword" id='confirm' className='input' />
              </div>
              <ErrorMessage name="confirmPassword" component="div" className='error text-danger mt-2' />
              <div className='text-center'>
                <button type="submit" className='submit-btn text-center' disabled={isSubmitting}>
                  {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>} Sign Up
                </button>
              </div>
            </Form>
          )}

        </Formik>
        <Link to='/login'>
          <p className='text-center info-btn mt-3'>
            Already have an account? Sign in
          </p>
        </Link>
      </div>

    </div>
  );
};

export default Signup;