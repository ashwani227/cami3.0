import React, { useState } from 'react';
import { Accordion } from 'react-bootstrap';
import ShareResource from '../../components/ShareResource/ShareResource';
import { UserProfile } from '../../helper/User';
import useAuthContext from '../../hooks/useAuthContext';

import './Profile.css';


const Profile = () => {

    const { user } = useAuthContext();
    const [profile, setupProfile] = useState(null);

    const [modalShow, setModalShow] = useState(false);
    const [shareableLink, setShareableLink] = useState("");

    React.useEffect(() => {
        const { email } = user;
        if (email) {
            UserProfile(email).then(response => {
                const { data } = response;
                setupProfile(data)
            }).catch(error => {
                console.error(error);
            })
        }
    }, [user])

    return (
        <div className='container my-5'>
            {
                profile && (
                    <div className='row align-items-center pb-5'>
                        <div className='col-12 text-center'>
                            <div className="pb-5 d-inline-block">
                                <div className="p-4 rounded-circle border-secondary bg-secondary d-flex justify-content-center align-items-center"
                                    style={{ width: '100px', height: '100px' }}
                                    alt="Avatar">
                                    <UserIcon />
                                </div>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className='rounded shadow-sm px-2 py-3 text-secondary' style={{ backgroundColor: '#f8f8f8' }}>
                                {profile.email}
                            </div>
                        </div>
                        <div className='col-12'>
                            <Accordion defaultActiveKey="0" className='my-5 shadow'>
                                <Accordion.Item eventKey="0" className='border-0'>
                                    <Accordion.Header className='shadow-sm'>My Saved Resources</Accordion.Header>
                                    <Accordion.Body>
                                        {profile?.savedResources && profile.savedResources.map((val, inx) => {
                                            const [title, url] = val.toString().split("::")
                                            return (
                                                <React.Fragment key={inx}>
                                                    <div className="card mb-3 px-3 px-sm-4">
                                                        <div className="row g-2 my-2">
                                                            <div className="col-md-10 col-sm-8 col-8">
                                                                <a className="card-title fw-bold link-secondary text-decoration-none max-two-lines"
                                                                    href={url} target={'_blank'} rel="noreferrer" title={title}>{title}</a>

                                                                <div className="profile-resource-tags">
                                                                    <div className="profile-resource-tag">Financial</div>
                                                                    <div className="profile-resource-tag">Knowledge</div>
                                                                    <div className="profile-resource-tag">Services</div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2 col-sm-4 col-4">
                                                                <a className="btn btn-success btn-sm mb-1 w-100"
                                                                    href={url} target={'_blank'} rel="noreferrer" >
                                                                    <i className="fas fa-save"></i>View
                                                                </a>
                                                                <button className="btn btn-light btn-sm text-danger mb-1 w-100">
                                                                    <i className="fas fa-save"></i>Unsave
                                                                </button>
                                                                <button className="btn btn-light btn-sm text-warning mb-1 w-100" onClick={() => {
                                                                    setModalShow(true)
                                                                    setShareableLink(url)
                                                                }}>
                                                                    <i className="fas fa-share-alt-square"></i>Share
                                                                </button>
                                                                <button className="btn btn-light btn-sm text-danger mb-1 w-100">
                                                                    <i className="fas fa-exclamation-triangle"></i>Report
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            )
                                        })
                                        }
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                        <div className='col-12 text-center'>
                            <button className="btn btn-danger px-5">
                                Delete Account
                            </button>
                        </div>
                    </div>
                )
            }

            <ShareResource modalShow={modalShow} setModalShow={setModalShow} shareableLink={shareableLink}/>
            
        </div>
    );
};


const UserIcon = ({ color = 'white' }) => {
    return (
        <svg x="0px" y="0px" viewBox="0 0 248.349 248.349">
            <g>
                <path fill={color} d="M9.954,241.305h228.441c3.051,0,5.896-1.246,7.805-3.416c1.659-1.882,2.393-4.27,2.078-6.723    c-5.357-41.734-31.019-76.511-66.15-95.053c-14.849,14.849-35.348,24.046-57.953,24.046s-43.105-9.197-57.953-24.046    C31.09,154.65,5.423,189.432,0.071,231.166c-0.315,2.453,0.424,4.846,2.078,6.723C4.058,240.059,6.903,241.305,9.954,241.305z" />
                <path fill={color} d="M72.699,127.09c1.333,1.398,2.725,2.73,4.166,4.019c12.586,11.259,29.137,18.166,47.309,18.166    s34.723-6.913,47.309-18.166c1.441-1.289,2.834-2.622,4.166-4.019c1.327-1.398,2.622-2.828,3.84-4.329    c9.861-12.211,15.8-27.717,15.8-44.6c0-39.216-31.906-71.116-71.116-71.116S53.059,38.95,53.059,78.16    c0,16.883,5.939,32.39,15.8,44.6C70.072,124.262,71.366,125.687,72.699,127.09z" />
            </g>
        </svg>
    );
}

export default Profile;