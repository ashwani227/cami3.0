import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { Notify } from '../../helper/Notify';

import useAuthContext from '../../hooks/useAuthContext';
import * as Yup from 'yup';

import './Login.css';

const DisplayingErrorMessagesSchema = Yup.object().shape({

  email: Yup.string().email('Invalid email').required('Email Required'),
  password: Yup.string()
    .required('Password Required')

});

const Login = () => {

  const { isLogin, authenticate, updateLoginStatus } = useAuthContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isLogin) {
      navigate('/')
    }
  }, [isLogin, navigate])

  return (
    <div>
      <div className='header'>
        <h2>Sign In</h2>
      </div>

      <div className='container-fluid container mt-4 login-container'>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={DisplayingErrorMessagesSchema}
          onSubmit={(values, { setSubmitting }) => {

            authenticate('login', values).then(response => {

              setSubmitting(true)
              const { data } = response || {};

              if (data?.email) {

                Notify('Login successfully!', 'success');
                window.localStorage.setItem("token", JSON.stringify(data.token));
                if (localStorage.getItem("token")) {
                  updateLoginStatus(true, data);
                }

                setSubmitting(false)
                navigate('/');
              }
              else if (data?.message) {
                Notify(data.message, 'error');
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
              <div className='text-center'>
                <button type="submit" className='submit-btn' disabled={isSubmitting}>
                  {isSubmitting && <span className="spinner-border spinner-border-sm" role="status"></span>} Sign In
                </button>
              </div>
            </Form>
          )}
        </Formik>


        <Link to='/signup'>
          <p className='text-center info-btn mt-3'>
            Don't have an account? Sign up
          </p>
        </Link>

      </div>

    </div>
  );
};

export default Login;