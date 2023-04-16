import React, { useEffect, useState } from "react"
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { Button, Card, Container, Navbar, NavItem } from "react-bootstrap"

import { Consent, NavigationBar } from "./components"

import About from "./pages/About/About"
import Chatbox from "./pages/ChatBox/Chatbox"
import Funders from "./pages/Funders/Funders"
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import Organizations from "./pages/Organizations/Organizations"
import Partners from "./pages/Partners/Partners"
import Profile from "./pages/Profile/Profile"
import Signup from "./pages/Signup/Signup"

import { ModalExtended } from "./components"

import useAuthContext from "./hooks/useAuthContext"
import { Notify } from "./helper/Notify"

import brand from "./images/brand.png"
import "react-toastify/dist/ReactToastify.css"
import "./App.scss"

function App() {
    const { isLogin } = useAuthContext()

    const [consent, setConsent] = useState(null)
    const { pathname } = useLocation()

    useEffect(() => {
        const agreement = window.localStorage.getItem("consentAgreed")
        setConsent(JSON.parse(agreement))
    }, [pathname])

    return (
        <div className="App">
            {
                consent === true && (
                    <NavigationBar />
                )
            }

            <div className={`${(consent === true) ? "body-margin-top" : "consent-wrapper"}`}> 
                {isLogin !== undefined && (
                    <Routes>
                        <Route element={<ConsentAgreement consent={consent} setConsent={setConsent} />}>
                            <Route path="/home" element={<Home />} />
                            <Route path="/chatBox" element={<Chatbox />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/partners" element={<Partners />} />
                            <Route path="/funders" element={<Funders />} />
                            <Route
                                path="/organizations"
                                element={<Organizations />}
                            />
                            <Route element={<PrivateRoute auth={isLogin} />}>
                                <Route
                                    path="/profile"
                                    element={<Profile />}
                                />
                            </Route>

                            <Route element={<ProtectedRoute auth={isLogin} />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                            </Route>

                            <Route
                                path="*"
                                element={<Navigate replace to="/home" />}
                            />
                        </Route>
                    </Routes>
                )}
            </div>
            <ToastContainer />
        </div>
    )
}

export default App

function PrivateRoute({ auth }) {
    return auth ? <Outlet /> : <Navigate to="/login" />
}

function ProtectedRoute({ auth }) {
    return !auth ? <Outlet /> : <Navigate to="/" />
}


const ConsentAgreement = ({ consent, setConsent }) => {

    const [confirmation, showConfirmation] = useState(false);

    if (consent === true) {
        return <Outlet />
    }

    const handleAgreement = () => {
        window.localStorage.setItem("consentAgreed", "true")
        Notify("Thank you for accepting the agreement.", "success")
        setConsent(true)
    }

    const handleDisagree = () => {
        showConfirmation(true)
        window.localStorage.setItem("consentAgreed", "false")
    }

    const redirectToGoogle = () => {
        window.localStorage.setItem("consentAgreed", "false")
        window.location.replace("https://www.google.com/")
    }

    return (
        <React.Fragment>
            <Navbar
                collapseOnSelect
                fixed={"top"}
                expand={false}
                className="bg-white shadow-sm"
            >
                <Container>
                    <NavItem className="nav-brand">
                        <img
                            src={brand}
                            alt="brand"
                            className="img-fluid"
                            width={100}
                        />
                    </NavItem>
                </Container>
            </Navbar>
            <Consent>
                <hr/>
                <div className="fs-6">
                    By using the chatbot, <span className="fw-bold">I agree</span> with the above statements and consent to take part in this study.
                </div>
                <div className="d-flex align-items-center justify-content-center flex-wrap">
                    <Button variant="danger" size="sm" className="mx-2" onClick={handleDisagree}>Disagree</Button>
                    <Button variant="success" size="sm" className="mx-2" onClick={handleAgreement}>Agree</Button>
                </div>
                <ModalExtended
                    show={confirmation}
                    onHide={() => showConfirmation(false)}
                    title={"Consent Agreement"}
                    size={"md"}
                >
                    <Card className="shadow-none border-0 rounded-0">
                        <Card.Body className="text-center">
                            Are you sure you don't want to explore the chatbot?
                        </Card.Body>
                        <Card.Footer className="bg-transparent border-0">
                            <div className="d-flex align-items-center justify-content-center flex-wrap">
                                <Button variant="danger" size="sm" className="mx-2" onClick={redirectToGoogle}>Disagree</Button>
                                <Button variant="success" size="sm" className="mx-2" onClick={handleAgreement}>Agree</Button>
                            </div>
                        </Card.Footer>
                    </Card>
                </ModalExtended>
            </Consent>
        </React.Fragment>
    )
}
