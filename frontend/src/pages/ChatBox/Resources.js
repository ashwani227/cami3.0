import React, { useEffect, useState } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import Pagination from '../../components/Pagination/Pagination';
import ShareResource from '../../components/ShareResource/ShareResource';
import { GetRelatedResources, GetResources } from '../../helper/Chat';
import { Notify } from '../../helper/Notify';
import { SaveResources } from '../../helper/User';
import useAuthContext from '../../hooks/useAuthContext';
import './Chatbox.css';


export const RenderResources = ({ entity = {} }) => {

    const [resources, setResources] = useState();

    const [recordToShow, createPaginationRecord] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [waiting, setWaiting] = useState(false);

    const [modalShow, setModalShow] = useState(false);
    const [shareableLink, setShareableLink] = useState("");

    const [resourceObject] = useState(entity || {});

    const isEmpty = (obj) => {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    useEffect(() => {
        if (!isEmpty(resourceObject)) {
            setWaiting(true);
            let resourceData = resourceObject;
            if ("userQuery" in resourceData) {
                delete resourceData["userQuery"]
            }
            GetResources(resourceData).then(response => {
                const { data } = response;
                if (data?.resources instanceof Array) {
                    setResources(data?.resources)
                }

                setWaiting(false);
            }).catch((error) => {
                console.error(error);
                setWaiting(false);
            })
        }
    }, [resourceObject])



    useEffect(() => {

        if (resources && resources.length > 0) {
            const indexOfLastPage = currentPage * 4;
            const indexOfFirstPage = indexOfLastPage - 4;
            createPaginationRecord(resources.slice(indexOfFirstPage, indexOfLastPage))
        }

    }, [resources, currentPage])


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    const [resetResources, setResetResources] = useState([]);
    const handleLabelClicked = event => {

        const text = event.target.textContent.trim() || event.target.innerText.trim();
        if (text) {
            setResetResources(prev => ([...prev, text]))
        }
    }

    return (
        <React.Fragment>
            <div className='container-fluid px-0'>
                <div className='row align-items-stretch g-3 my-3'>
                    {
                        (!isEmpty(resourceObject) && recordToShow.length > 0) &&
                        <React.Fragment>
                            {
                                recordToShow.map((data, index) => (
                                    <div className='col-lg-6' key={index}>
                                        <Resource data={data} setModalShow={setModalShow} setShareableLink={setShareableLink} handleLabelClicked={handleLabelClicked} />
                                    </div>
                                ))
                            }
                            <div className='col-12'>
                                <Pagination handlePagination={paginate} recordsPerPage={4}
                                    totalRecords={resources.length} currentPage={currentPage} />
                            </div>
                        </React.Fragment>
                    }
                    {
                        (!isEmpty(resourceObject) && waiting) &&
                        <div className='col-12'>
                            <TypingAnimation />
                        </div>
                    }
                    {
                        (!isEmpty(resourceObject) && recordToShow.length <= 0 && !waiting) &&
                        <React.Fragment>
                            <div className='row align-items-center justify-content-between my-2'>
                                <div className='col-12 text-center'>
                                    <p className='card-text text-danger'>No Record Found</p>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                    {
                        (isEmpty(resourceObject) && recordToShow.length <= 0) &&
                        <React.Fragment>
                            <div className='row align-items-center justify-content-between my-2'>
                                <div className='col-12 text-center'>
                                    <p className='card-text text-danger'>No valid data found... </p>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                </div>
                {
                    resetResources.length > 0 && (
                        resetResources.map((val, idx) => (
                            <RelatedResources key={idx} condition={val} />
                        ))
                    )
                }
                <ShareResource modalShow={modalShow} setModalShow={setModalShow} shareableLink={shareableLink} />
            </div>
        </React.Fragment>
    );
}


export const RelatedResources = ({ condition }) => {

    const [resources, setResources] = useState();

    const [recordToShow, createPaginationRecord] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [waiting, setWaiting] = useState(false);

    const [modalShow, setModalShow] = useState(false);
    const [shareableLink, setShareableLink] = useState("");

    const [relatedCondition] = useState(condition || "");

    useEffect(() => {
        if (relatedCondition) {
            setWaiting(true);
            GetRelatedResources(relatedCondition).then(response => {
                const { data } = response;
                if (data?.resources instanceof Array) {
                    setResources(data?.resources)
                }

                setWaiting(false);
            }).catch((error) => {
                console.error(error);
                setWaiting(false);
            })
        }
    }, [relatedCondition])

    useEffect(() => {

        if (resources && resources.length > 0) {
            const indexOfLastPage = currentPage * 4;
            const indexOfFirstPage = indexOfLastPage - 4;
            createPaginationRecord(resources.slice(indexOfFirstPage, indexOfLastPage))
        }

    }, [resources, currentPage])


    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    const [resetResources, setResetResources] = useState([]);
    const handleLabelClicked = event => {

        const text = event.target.textContent.trim() || event.target.innerText.trim();
        if (text) {
            setResetResources(prev => ([...prev, text]))
        }
    }

    return (
        <React.Fragment>
            <div className='container-fluid px-0'>
                <div className='row align-items-stretch g-3 my-3'>
                    {
                        (relatedCondition !== "" && recordToShow.length > 0) &&
                        <React.Fragment>
                            {
                                recordToShow.map((data, index) => (
                                    <div className='col-lg-6' key={index}>
                                        <Resource data={data} setModalShow={setModalShow} setShareableLink={setShareableLink} handleLabelClicked={handleLabelClicked} />
                                    </div>
                                ))
                            }
                            <div className='col-12'>
                                <Pagination handlePagination={paginate} recordsPerPage={4}
                                    totalRecords={resources.length} currentPage={currentPage} />
                            </div>
                        </React.Fragment>
                    }
                    {
                        (relatedCondition !== "" && waiting) &&
                        <div className='col-12'>
                            <TypingAnimation />
                        </div>
                    }
                    {
                        (relatedCondition !== "" && recordToShow.length <= 0 && !waiting) &&
                        <React.Fragment>
                            <div className='row align-items-center justify-content-between my-2'>
                                <div className='col-12 text-center'>
                                    <p className='card-text text-danger'>No Record Found</p>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                    {
                        (!relatedCondition && recordToShow.length <= 0) &&
                        <React.Fragment>
                            <div className='row align-items-center justify-content-between my-2'>
                                <div className='col-12 text-center'>
                                    <p className='card-text text-danger'>No valid data found... </p>
                                </div>
                            </div>
                        </React.Fragment>
                    }
                </div>

                <ShareResource modalShow={modalShow} setModalShow={setModalShow} shareableLink={shareableLink} />
            </div>
            {
                resetResources.length > 0 && (
                    resetResources.map((val, idx) => (
                        <RelatedResources key={idx} condition={val} />
                    ))
                )
            }
        </React.Fragment>
    );
}

const Resource = ({ data = {}, setModalShow, setShareableLink, handleLabelClicked = undefined }) => {

    const { title, url, labels, imageFileName, category, type } = data;
    const { isLogin, user } = useAuthContext();
    const [resource, renderResource] = useState({
        data: [],
        itemsToShow: 5,
        expanded: false
    })


    useEffect(() => {

        renderResource((prev) => ({
            ...prev,
            data: [].concat(type === "video" ? [type || "N/A"] : [], category ? [category || "N/A"] : [], labels)
        }))

    }, [labels, category, type])

    const handleResourceSave = () => {
        const { email } = user;
        if (isLogin && email) {
            SaveResources(email, title + "::" + url).then(response => {
                const { data } = response;
                if (data && data?.message) {
                    Notify(data.message, 'success');
                } else {
                    Notify("Resource has been saved!", 'success');
                }
            }).catch((error) => {
                Notify("Something went wrong. Please try again!", 'error');
            })
        } else {
            Notify("Please login to save resources", 'error');
        }
    }

    // const showMore = () => {
    //     resource.itemsToShow === 3 ? (
    //         renderResource({ ...resource, itemsToShow: resource.data.length, expanded: true })
    //     ) : (
    //         renderResource({ ...resource, itemsToShow: 3, expanded: false })
    //     )
    // }


    const YouTubeGetID = (url) => {
        let ID = '';
        url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if (url[2] !== undefined) {
            //eslint-disable-next-line
            ID = url[2].split(/[^0-9a-z_\-]/i);
            ID = ID[0];
        }
        else {
            ID = url;
        }
        return ID;
    }


    const popover = (
        <Popover id="popover-resource-help">
            <Popover.Body>
                These terms are often related to your search term
            </Popover.Body>
        </Popover>
    );


    return (
        <div className="resource-container">
            <div className="resource-name">{title}</div>
            <div className="resource-card">
                <div className="resource-image">
                    {
                        (type && type !== "" && type === "video") ? (
                            <img className="resource-image-icon" alt={`${title} thumbnail`} src={`http://img.youtube.com/vi/${YouTubeGetID(url)}/maxresdefault.jpg`}></img>
                        ) : (
                            (type && type !== "" && type === "webpage") ?
                                (imageFileName && imageFileName !== "") ?
                                    <img alt={`${title} website preview`} src={`https://cami.med.ualberta.ca/chat/media/${imageFileName}`}
                                        className="resource-image-icon" /> : null : null
                        )
                    }
                </div>
                <div className="resource-info">
                    <div className="info-header">
                        <p className="info-text">Related To:</p>
                        <OverlayTrigger trigger="click" placement="top" overlay={popover}>
                            <button className="btn btn-outline-dark question-mark-icon">
                                <i className="fas fa-question">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z" />
                                    </svg>
                                </i>
                            </button>
                        </OverlayTrigger>
                    </div>
                    <div className="related-terms-container">
                        {
                            resource.data.length > 0 && resource.data.slice(0, resource.itemsToShow).map((val, index) => {

                                if (index > 0 && val !== category) {
                                    return (
                                        <button className={`btn related-term`} key={index} onClick={(event) => {
                                            if (index > 0 && handleLabelClicked) {
                                                handleLabelClicked(event)
                                            } else {
                                                event.preventDefault()
                                            }
                                        }}> {val} </button>
                                    )
                                } else {
                                    return (
                                        <div className="d-inline-block related-term" key={index}>{val}</div>
                                    );
                                }
                            })
                        }
                    </div>

                </div>
            </div>
            <hr />
            <div className="resource-action-buttons resource-buttons">
                {/* <button className="action-button save-button">Save</button>
                <button className="action-button share-button">Share</button>
                <button className="action-button report-button">Report</button> */}
                <button className="btn action-button save-button" data-status="-1" onClick={handleResourceSave}>
                    <i className="fas fa-save"></i>Save
                </button>
                <button className="btn action-button share-button" onClick={() => {
                    setModalShow(true)
                    setShareableLink(url)
                }}>
                    <i className="fas fa-share-alt-square"></i>Share
                </button>
                <button className="btn action-button report-button">
                    <i className="fas fa-exclamation-triangle"></i>Report
                </button>
            </div>
        </div>
    )

    // return (
    //     <div className="resource-container h-100 justify-content-between">
    //         <div className="image-container position-relative">
    //             {
    //                 (type && type !== "" && type === "video") ? <div className='position-relative'>
    //                     <img src={`http://img.youtube.com/vi/${YouTubeGetID(url)}/maxresdefault.jpg`}
    //                         alt="Video Thumbnail" className="resource-image w-100" />
    //                     {/* <div className='position-absolute start-50 tranalate-middle top-50'>
    //                         <svg x="0px" y="0px" viewBox="0 0 481 481">
    //                             <g>
    //                                 <path d="M410.6,70.4C365.1,25,304.7,0,240.5,0S115.9,25,70.4,70.4C25,115.9,0,176.3,0,240.5s25,124.6,70.4,170.1    C115.8,456,176.2,481,240.5,481s124.6-25,170.1-70.4C456,365.2,481,304.8,481,240.5S456,115.9,410.6,70.4z M240.5,454    C122.8,454,27,358.2,27,240.5S122.8,27,240.5,27S454,122.8,454,240.5S358.2,454,240.5,454z" />
    //                                 <path d="M349.2,229.1l-152.6-97.9c-4.2-2.7-9.4-2.9-13.8-0.5c-4.3,2.4-7,6.9-7,11.8v195.7c0,4.9,2.7,9.5,7,11.8    c2,1.1,4.3,1.7,6.5,1.7c2.5,0,5.1-0.7,7.3-2.1l152.6-97.9c3.9-2.5,6.2-6.8,6.2-11.4S353,231.6,349.2,229.1z M202.8,313.7V167.3    l114.1,73.2L202.8,313.7z" />
    //                             </g>
    //                         </svg>
    //                     </div> */}
    //                 </div> :
    //                     (type && type !== "" && type === "webpage") ?
    //                         (imageFileName && imageFileName !== "") ? <img src={`https://cami.med.ualberta.ca/chat/media/${imageFileName}`}
    //                             alt="" className="resource-image w-100" /> : null : null
    //             }
    //         </div>
    //         <div className="resource-tag-container d-flex align-items-stretch flex-column h-100 justify-content-around">
    //             <a className={`tag-header card-link link-light text-decoration-none max-two-lines ${(title && title !== "") ? 'text-capitalize ' : ''}`}
    //                 href={url} target={'_blank'} rel="noreferrer" title={title}>{title || url}</a>

    //             <div className="resource-tags">
    //                 {
    //                     resource.data.length > 0 && resource.data.slice(0, resource.itemsToShow).map((val, index) => {

    //                         if (index > 0 && val !== category) {
    //                             return (
    //                                 <button className={`btn btn-sm btn-light resource-tag ${index > 0 ? "btn-labels" : ""}`} key={index} onClick={(event) => {
    //                                     if (index > 0 && handleLabelClicked) {
    //                                         handleLabelClicked(event)
    //                                     } else {
    //                                         event.preventDefault()
    //                                     }
    //                                 }}> {val} </button>
    //                             )
    //                         } else {
    //                             return (
    //                                 <div className="resource-tag" key={index}>{val}</div>
    //                             );
    //                         }

    //                         // return (
    //                         //     {
    //                         //         index > 0 ? 
    //                         //     }
    //                         //     <div className="resource-tag" key={index} onClick={(event) => {
    //                         //         if(index > 0 && handleLabelClicked) {
    //                         //             handleLabelClicked(event)
    //                         //         } else {
    //                         //             event.preventDefault()
    //                         //         }
    //                         //     }}>{val}</div>
    //                         // )
    //                     })
    //                 }

    //                 <button className="more-tags mx-0" onClick={showMore}>
    //                     {resource.expanded ? (
    //                         <span>See less</span>
    //                     ) : (
    //                         <span>See more</span>
    //                     )}
    //                 </button>
    //             </div>
    //         </div>
    //         <div className="resource-buttons">
    //             <button className="btn btn-light btn-sm text-danger" data-status="-1" onClick={handleResourceSave}>
    //                 <i className="fas fa-save"></i>Save
    //             </button>
    //             <button className="btn btn-light btn-sm text-warning" onClick={() => {
    //                 setModalShow(true)
    //                 setShareableLink(url)
    //             }}>
    //                 <i className="fas fa-share-alt-square"></i>Share
    //             </button>
    //             <button className="btn btn-light btn-sm text-danger">
    //                 <i className="fas fa-exclamation-triangle"></i>Report
    //             </button>
    //         </div>
    //     </div>
    // );
};

const TypingAnimation = () => {

    const typingRef = React.useRef();
    useEffect(() => {

        if (typingRef?.current) {
            typingRef.current.scrollIntoView()
        }

    }, [])

    return (
        <div className="sp-ms7">
            <span className="spinme-left">
                <div className="spinner" ref={typingRef}>
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
            </span>
        </div>
    );
}
