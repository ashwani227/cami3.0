import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

import { RelatedResources, RenderResources } from './Resources';
import { Notify } from '../../helper/Notify';

import { GetEntities, GetQuestionByNumber, SavePhoneNumber, ShowTips } from '../../helper/Chat';
import Chats from './Chats';

import { ErrorHandling } from "../../helper/GlobalFunctions";

import bot from '../../images/robot.png';
import user from '../../images/user.png';

import './Chatbox.css';

const Chatbox = () => {

    const [questions, setQuestions] = useState([]);
    const [waiting, setWaiting] = useState(false);
    const [userEntity, setUserEntity] = useState({
        userQuery: ''
    })

    const [relatedCondition, setRelatedCondition] = useState(undefined);
    const [tips, toggleTips] = useState(false)

    const [relatedConditionsVisited, setRelatedConditionsVisited] = useState([]);
    const [relatedConditions, setRelatedConditions] = useState([]);

    const [elementID, setElementID] = useState(0);
    const [NetworkError, setNetworkError] = useState(false)

    const navigate = useNavigate();

    const handleQuestionChange = (nextQuestionNumber, currentQuestionID = -1) => {
        setWaiting(true)

        if (currentQuestionID && parseInt(currentQuestionID) > 0) {
            document.querySelectorAll(`.chat-btn-${currentQuestionID}`)?.forEach(elem => {
                elem.disabled = true;
                elem.classList.add("d-none");
                let DivClasses = `btn operate-button disabled chat-btn-div-${currentQuestionID}`;

                if (elem.classList.contains("operate-button-ask")) {
                    DivClasses += " operate-button-ask";
                }

                if (elem.classList.contains("btn-related-conditions-continue")) {
                    DivClasses += " btn-related-conditions-continue"
                }

                elem.insertAdjacentHTML("afterend", `<div class='${DivClasses}'> ${elem.innerHTML} </div>`)
                elem.remove();
            });

            document.querySelectorAll(`.chat-textinput-${currentQuestionID}`)?.forEach(elem => {

                elem.disabled = true;
                elem.classList.add("d-none");

                elem.insertAdjacentHTML("afterend", `<div class='user-input disabled chat-textinput-div-${currentQuestionID}'> ${elem.dataset.value || ""} </div>`)
                elem.remove();
            });
        }

        GetQuestionByNumber(nextQuestionNumber).then(response => {
            if (response) {
                const { data } = response;
                if (data) {

                    setQuestions(prevQuestions => ([...prevQuestions, ...data]))
                    setElementID(prev => {
                        return (prev + 1)
                    })
                    setWaiting(false)
                }
            } else {
                Notify("Something's not right. Please try again later.", "error")
                setWaiting(false)
            }

        }).catch(error => {
            setWaiting(false)
            setNetworkError(true)
        })
    }

    useEffect(() => {
        setQuestions([])
        setWaiting(false)
        setUserEntity({
            userQuery: ''
        })
        setRelatedConditions([])
        setRelatedCondition(undefined)
        setRelatedConditionsVisited([])
        toggleTips(false)

        handleQuestionChange(1)

    }, [])

    const handleInputChange = event => {

        const text = event.target.value;
        const name = event.target.dataset.name;

        setUserEntity({
            ...userEntity,
            [name]: text
        })

    }

    const handleKeyPress = event => {

        if (event.key === 'Enter') {

            const text = event.target.value;
            const questionId = event.target.dataset.question;

            if (text) {

                const functionCall = event.target.dataset.function;
                const value = event.target.dataset.value;
                const name = event.target.dataset.name;

                if (functionCall !== '' && functionCall === "getEntities" && name === "userQuery") {
                    handleEntity(value, 2, questionId)
                } else if (functionCall !== '' && functionCall === "addSubscriber") {
                    saveUserPhoneNumber(value, 105, questionId)
                } else {
                    setUserEntity({
                        ...userEntity,
                        [name]: text,
                    })
                    handleQuestionChange(5, questionId)
                }

            } else {
                Notify('Please enter a value!', "error")
            }
        }
    }

    const handleChatActions = event => {

        const value = event.target.dataset.value;
        const nextQuestion = event.target.dataset.next;
        const functionCall = event.target.dataset.function;
        const name = event.target.dataset.name;

        const text = event.target.textContent.trim() || event.target.innerText.trim();
        const buttonType = event.target.dataset.condition;
        const questionId = event.target.dataset.question;

        if (nextQuestion && parseInt(nextQuestion) >= -1) {
            switch (parseInt(nextQuestion)) {
                case -1:
                    navigate('/');
                    break;
                case 2:
                    if (value) {
                        if (functionCall !== '' && functionCall === "getEntities" && name === "userQuery") {
                            handleEntity(value, nextQuestion, questionId)
                        }
                    } else {
                        Notify('Please enter a value!', "error")
                    }
                    break;
                case 105:
                    if (value) {
                        if (functionCall !== '' && functionCall === "addSubscriber") {
                            saveUserPhoneNumber(value, nextQuestion, questionId)
                        }
                    } else {
                        Notify('Please enter a value!', "error")
                    }
                    break;
                case 3:

                    let searchedCategory = false;
                    let nQuestion = parseInt(nextQuestion)
                    if ("searchedCategory" in userEntity && userEntity["searchedCategory"].includes("core knowledge")) {
                        searchedCategory = true;
                    }

                    if ("AGE" in userEntity && userEntity["AGE"] !== "") {

                        if (searchedCategory) {
                            if ("location" in userEntity && userEntity["location"] !== "") {

                            } else {
                                setUserEntity({
                                    ...userEntity,
                                    location: "all",
                                })
                            }
                            nQuestion = 5
                            // handleQuestionChange(5, questionId)
                        } else {
                            if ("location" in userEntity && userEntity["location"] !== "") {
                                nQuestion = 5
                            } else {
                                nQuestion = 4
                            }
                            // handleQuestionChange(4, questionId)
                        }
                    } else {
                        if (searchedCategory) {
                            if ("location" in userEntity && userEntity["location"] !== "") {

                            } else {
                                setUserEntity({
                                    ...userEntity,
                                    location: "all",
                                })
                            }
                            nQuestion = parseInt(nextQuestion)
                            // handleQuestionChange(parseInt(nextQuestion), questionId)
                        } else {
                            nQuestion = parseInt(nextQuestion)
                            // handleQuestionChange(parseInt(nextQuestion), questionId)
                        }
                    }

                    if (functionCall !== '' && functionCall === "getEntities" && name === "userQuery") {
                        if (text) {
                            handleEntity(text, nQuestion, questionId)
                        } else {
                            Notify('Text not found!', "error")
                        }
                    } else {
                        handleQuestionChange(nQuestion, questionId)
                    }

                    break;
                case 4:

                    let age = "all";
                    if (((name.toLowerCase() === "age") && ("AGE" in userEntity && userEntity["AGE"] === ""))) {
                        age = (text === "Teenager") ? "Teen" : (text === "Skip") ? "all" : text
                    }

                    if ("location" in userEntity && userEntity["location"] !== "") {
                        setUserEntity({
                            ...userEntity,
                            AGE: age,
                        })
                        handleQuestionChange(5, questionId)

                    } else {

                        if ("searchedCategory" in userEntity && userEntity["searchedCategory"].includes("core knowledge")) {
                            setUserEntity({
                                ...userEntity,
                                AGE: age,
                                location: "all",
                            })

                            handleQuestionChange(5, questionId)

                        } else {
                            setUserEntity({
                                ...userEntity,
                                AGE: age,
                            })
                            handleQuestionChange(parseInt(nextQuestion), questionId)
                        }
                    }
                    break;
                case 5:
                    if (value) {
                        if (functionCall !== '' && functionCall === "getEntities" && name === "userQuery") {
                            handleEntity(value, nextQuestion, questionId)
                        } else {
                            setUserEntity({
                                ...userEntity,
                                [name]: text,
                            })
                            handleQuestionChange(parseInt(nextQuestion), questionId)
                        }
                    } else {
                        Notify('Please enter a value!', "error")
                    }
                    break;
                case 66:
                    if (text) {
                        setRelatedCondition(text)
                        if (buttonType !== "restart") {
                            setRelatedConditionsVisited(current => [...current, text]);
                        }
                        handleQuestionChange(parseInt(nextQuestion), questionId)
                    } else {
                        Notify('Invalid Condition Name Found, Please try again.', "error")
                    }
                    break;
                case 6:
                    if (((name.toLowerCase() === "location") && ("location" in userEntity && userEntity["location"] === ""))) {
                        setUserEntity({
                            ...userEntity,
                            location: "all",
                        })
                    }

                    if (("HPO-DDD" in userEntity && userEntity["HPO-DDD"].length <= 0)) {
                        handleQuestionChange(99, questionId)
                    } else {

                        if (relatedConditions?.length > 0) {
                            handleQuestionChange(parseInt(nextQuestion), questionId)
                        } else {
                            handleQuestionChange(100, questionId)
                        }
                    }
                    break;
                case 7:
                    if (relatedConditions?.length > 0) {
                        handleQuestionChange(parseInt(nextQuestion), questionId)
                    } else {
                        handleQuestionChange(100, questionId)
                    }
                    break;
                case 8:
                case 10:
                    setUserEntity({
                        ...userEntity,
                        userQuery: ''
                    })
                    handleQuestionChange(parseInt(nextQuestion), questionId)
                    break;
                case 103:
                    if (functionCall === "showTips" && name === "userTips") {
                        toggleTips(true)
                    }
                    handleQuestionChange(parseInt(nextQuestion), questionId)
                    break;
                default:
                    handleQuestionChange(parseInt(nextQuestion), questionId)
                    break;
            }
        }
    }

    const handleEntity = (value, nextQuestion, currentQuestionID = -1) => {
        setWaiting(true)
        GetEntities(value).then(response => {
            if (response) {

                const { data } = response || null;
                let age = data["AGE"];
                let loc = data["location"];
                let searchedCat = data["searchedCategory"];

                if ("AGE" in userEntity && userEntity["AGE"] !== "") {
                    age = userEntity["AGE"]
                }

                if ("location" in userEntity && userEntity["location"] !== "") {
                    loc = userEntity["location"]
                }

                if ("searchedCategory" in userEntity && userEntity["searchedCategory"]) {
                    searchedCat = Array.from(new Set([].concat(...userEntity["searchedCategory"])))
                }

                setUserEntity({
                    ...userEntity,
                    ...data,
                    AGE: age,
                    location: loc,
                    searchedCategory: searchedCat
                })

                if (data?.relatedConditions) {
                    setRelatedConditions(data?.relatedConditions)
                }

                handleQuestionChange(parseInt(nextQuestion), currentQuestionID)
            } else {
                Notify("Something's not right. Please try again later.", "error")
                setWaiting(false)
            }
        }).catch(error => {
            setWaiting(false)
            console.error(error);
            Notify(ErrorHandling(error), "error")
        })
    }


    const saveUserPhoneNumber = (value, nextQuestion, questionId) => {
        const phoneRegex = /(\+\d{1,3}\s?)?((\(\d{3}\)\s?)|(\d{3})(\s|-?))(\d{3}(\s|-?))(\d{4})(\s?(([E|e]xt[:|.|]?)|x|X)(\s?\d+))?/g
        if (phoneRegex.test(value)) {
            setWaiting(true)
            SavePhoneNumber(value).then(response => {
                setWaiting(false)
                const data = response?.data;
                if (data) {
                    Notify(data?.Message ?? "Phone number received", "info")
                    handleQuestionChange(parseInt(nextQuestion), questionId)
                }
            }).catch(error => {

                setWaiting(false)
                console.error(error);
                Notify(ErrorHandling(error), "error")
            })
        } else {
            Notify("Invalid Phone Number Provided", "error")
            return;
        }
    }


    useEffect(() => {

        if (questions.length > 0) {
            let items = document.querySelectorAll(".chat-history");
            const yOffset = -25;
            if (questions.length <= 1) {
                let first = items[0];
                const yCordinates = first.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: yCordinates, behavior: 'smooth' });
            } else {

                let last = items[items.length - 1];
                const yCordinates = last.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: yCordinates, behavior: 'smooth' });
            }
        }

    }, [questions])


    return (
        <div className='container my-3'>
            {
                NetworkError &&
                <div className='row'>
                    <div className='col-12'>
                        <Alert show={NetworkError} variant="danger">
                            <div role="alert" className="Toastify__toast-body">
                                <div className="Toastify__toast-icon Toastify--animate-icon Toastify__zoom-enter">
                                    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="#e74c3c">
                                        <path d="M11.983 0a12.206 12.206 0 00-8.51 3.653A11.8 11.8 0 000 12.207 11.779 11.779 0 0011.8 24h.214A12.111 12.111 0 0024 11.791 11.766 11.766 0 0011.983 0zM10.5 16.542a1.476 1.476 0 011.449-1.53h.027a1.527 1.527 0 011.523 1.47 1.475 1.475 0 01-1.449 1.53h-.027a1.529 1.529 0 01-1.523-1.47zM11 12.5v-6a1 1 0 012 0v6a1 1 0 11-2 0z"></path>
                                    </svg>
                                </div>
                                <div>There is a network issue please try again later</div>
                            </div>
                            <div className='d-flex align-center justify-content-end'>
                                <button className='btn btn-sm operate-button' onClick={() => {
                                    setNetworkError(false)
                                    navigate('/')
                                }}>Okay!</button>
                            </div>
                        </Alert>
                    </div>
                </div>
            }

            <div className='row justify-content-between chat gx-0'>
                <div className='col-auto'>
                    <img src={bot} className='img-fluid' width={64} height={64} alt=''></img>
                </div>
                <div className='col'>
                    {
                        questions.map((question, questionIndex) => {
                            const { fields, pk } = question
                            const { buttons, category, functionCall, text, type } = fields;

                            let function_call = '';
                            let input_type = "text";
                            if (functionCall[0]?.mandatory) {
                                if (functionCall[1]?.name) {
                                    function_call = functionCall[1]?.name
                                }
                            }

                            let name = '';
                            if (category[0]?.addToState) {
                                name = category[1]?.name
                            }

                            if (function_call === "addSubscriber") {
                                input_type = "number"
                            }

                            return (

                                <React.Fragment key={questionIndex}>

                                    <Chats question={text} entity={userEntity}>
                                        {(type === "textfield") &&
                                            <div className='row align-items-center user-textfields'>
                                                <div className="col user-input-container mt-2 mb-2">
                                                    <input type={input_type} className={`user-input chat-textinput-${elementID}`}
                                                        data-id={pk} data-function={function_call} data-question={elementID}
                                                        data-name={name} data-value={userEntity[name]}
                                                        onKeyPress={handleKeyPress} onChange={handleInputChange} disabled={(questionIndex !== (questions.length - 1)) || waiting} />
                                                </div>
                                                <div className='col-auto'>
                                                    <img src={user} className='img-fuild' width={32} height={32} alt=''></img>
                                                </div>
                                            </div>

                                        }

                                        {
                                            <RenderResourceTips render={tips} resetTipCheck={toggleTips} />
                                        }
                                        {
                                            (function_call === 'getResources') && <RenderResources entity={userEntity} />
                                        }
                                        {
                                            ((name === "relatedResources" && function_call === "getRelatedResources") && relatedCondition !== undefined) && <RelatedResources condition={relatedCondition} />
                                        }

                                        <div className='row gx-0 align-items-center justify-content-start'>
                                            {
                                                buttons.map((button, btnIndex) => (
                                                    <React.Fragment key={questionIndex + "--" + btnIndex}>
                                                        {
                                                            (button.text === "Hard Code" && relatedConditions.length > 0) ? (
                                                                <React.Fragment>
                                                                    {
                                                                        relatedConditions.map((value, indx) => (
                                                                            <div className='col-auto' key={questionIndex + "-" + indx + "-" + btnIndex}>
                                                                                <button className={`btn operate-button chat-btn-${elementID} ${relatedConditionsVisited.includes(value) ?? "operate-button-disabled"}`}
                                                                                    data-id={pk} data-function={function_call}
                                                                                    data-name={name} data-question={elementID}
                                                                                    data-next="66" data-condition={"related"}
                                                                                    onClick={handleChatActions}
                                                                                    disabled={(questionIndex !== (questions.length - 1)) || waiting || relatedConditionsVisited.includes(value)}> {value} </button>
                                                                            </div>
                                                                        ))
                                                                    }

                                                                    <div className='col-auto'>
                                                                        <button className={`btn operate-button operate-button-ask chat-btn-${elementID}`}
                                                                            data-id={pk} data-function={function_call}
                                                                            data-name={name} data-question={elementID}
                                                                            data-next="8" data-condition={"restart"}
                                                                            onClick={handleChatActions} disabled={(questionIndex !== (questions.length - 1)) || waiting}> Something New </button>
                                                                    </div>
                                                                    <div className='col-auto'>
                                                                        <button className={`btn operate-button btn-related-conditions-continue chat-btn-${elementID}`}
                                                                            data-id={pk} data-function={function_call}
                                                                            data-name={name} data-question={elementID}
                                                                            data-next="102" onClick={handleChatActions} disabled={(questionIndex !== (questions.length - 1)) || waiting}> Continue </button>
                                                                    </div>
                                                                </React.Fragment>
                                                            ) : (
                                                                <div className='col-auto' key={questionIndex + "-" + btnIndex}>
                                                                    {
                                                                        (button.href && button.href !== "") ? (
                                                                            <a href={button.href} className={`btn operate-button chat-btn-${elementID}`}
                                                                                data-id={pk} data-function={function_call}
                                                                                data-name={name} data-value={userEntity[name]} data-question={elementID}
                                                                                data-next={button.nextQuestion} rel="noopener noreferrer" target={"_blank"}
                                                                                onClick={handleChatActions} disabled={(questionIndex !== (questions.length - 1)) || waiting}> {button.text || "Okay"} </a>
                                                                        ) : (
                                                                            <button className={`btn operate-button chat-btn-${elementID}`}
                                                                                data-id={pk} data-function={function_call}
                                                                                data-name={name} data-value={userEntity[name]} data-question={elementID}
                                                                                data-next={button.nextQuestion}
                                                                                onClick={handleChatActions} disabled={(questionIndex !== (questions.length - 1)) || waiting}> {button.text || "Okay"} </button>
                                                                        )
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </React.Fragment>
                                                ))
                                            }
                                        </div>
                                    </Chats>
                                </React.Fragment>
                            );
                        })

                    }

                    <div className='col-12 next-question'>
                        {waiting && <TypingAnimation />}
                    </div>
                </div>
            </div>
            {/* <Footer/> */}
        </div>
    );

};


const TypingAnimation = () => {
    return (
        <div className="sp-ms7">
            <span className="spinme-left">
                <div className="spinner">
                    <div className="bounce1"></div>
                    <div className="bounce2"></div>
                    <div className="bounce3"></div>
                </div>
            </span>
        </div>
    );
}


const RenderResourceTips = ({ render = false, resetTipCheck = undefined }) => {

    const [tips, setTips] = useState([])
    const [renderTips] = useState(render)

    useEffect(() => {
        if (renderTips) {
            ShowTips().then(response => {
                const data = response?.data;
                console.log(response);
                if (data) {
                    if (typeof data === "object") {
                        setTips(prev => ([
                            ...prev,
                            data.Tip || "record not found"
                        ]))
                    } else {
                        setTips(data)
                    }
                }

                resetTipCheck(false)
            }).catch(error => {
                setTips("")
                resetTipCheck(false)
                Notify(ErrorHandling(error), "error")
            })
        }
    }, [renderTips, resetTipCheck])

    if (!renderTips) {
        return null
    }

    return (
        <React.Fragment>
            {tips.length ? (
                <div className="row gx-0 align-items-center justify-content-start chat-history">
                    <div className='col-12 mt-2 mb-2'>
                        <div className='question w-100 mb-0'>
                            {
                                tips.map((value, indx) => (
                                    <React.Fragment key={indx}>
                                        <p> {value} </p>
                                    </React.Fragment>
                                ))
                            }
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container-fluid px-0">
                    <div className="row align-items-center justify-content-between g-3 my-3">
                        <div className="col-12 text-center">
                            {
                                typeof tips === "string" ? (
                                    <p className="card-text text-danger">
                                        No Record Found
                                    </p>
                                ) : <TypingAnimation />
                            }
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    )
}
export default Chatbox;
