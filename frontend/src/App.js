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

    // return (
    //     <React.Fragment>
    //         <Navbar
    //             collapseOnSelect
    //             fixed={"top"}
    //             expand={false}
    //             className="bg-white"
    //         >
    //             <Container>
    //                 <NavItem className="nav-brand">
    //                     <img
    //                         src={brand}
    //                         alt="brand"
    //                         className="img-fluid"
    //                         width={100}
    //                     />
    //                 </NavItem>
    //             </Container>
    //         </Navbar>
    //         <Container>
    //             <Row className="align-items-center justify-content-center">
    //                 <Col lg={6} md={8}>
    //                     <Card>
    //                         <Card.Header className="text-center">
    //                             Consent Agreement
    //                             <div className="card-subtitle text-muted small">
    //                                 Please read it through and make your decision. Thank You!
    //                             </div>
    //                         </Card.Header>
    //                         <Card.Body>
    //                             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum felis tortor, egestas vitae blandit vel, iaculis ut elit. Integer gravida consequat rhoncus. Sed tincidunt leo in finibus tincidunt. Quisque at felis tristique, egestas diam vitae, feugiat mauris. Donec arcu ipsum, fermentum sit amet dui nec, cursus tempus nunc. Fusce odio augue, feugiat ac egestas a, imperdiet vitae ipsum. Curabitur tincidunt eleifend nulla, eget dapibus mi pharetra a. Ut non ex justo. Ut porta purus sed tristique vulputate. Morbi viverra velit a turpis tincidunt, non pulvinar est pharetra.

    //                             Integer pretium velit eu magna pretium scelerisque. Aenean porttitor augue eu hendrerit accumsan. Aliquam erat volutpat. In auctor commodo nunc eget maximus. Suspendisse potenti. Curabitur convallis mi tellus, id congue dolor pellentesque in. Nullam eu justo dictum, convallis neque ac, tincidunt dolor. Ut tempus massa eu iaculis consectetur. Vivamus porta est a ligula gravida pretium. Proin lacinia ante id tellus semper rutrum.

    //                             Cras commodo luctus leo. Donec sit amet eros a quam sagittis placerat. Aenean lacinia ullamcorper convallis. Duis a odio tempus dolor ullamcorper posuere nec et orci. Morbi libero dui, sagittis ut lacus ut, feugiat fermentum magna. Ut lorem mauris, consequat eu ex vitae, sollicitudin sagittis elit. In sed metus tortor. Suspendisse lacinia, est a facilisis accumsan, augue turpis commodo est, luctus suscipit magna nibh sit amet dolor. Donec sit amet tortor dui. Nulla neque libero, dictum volutpat dictum id, ornare non nisl. Aenean viverra congue arcu ac rutrum. Sed vitae odio felis. Nullam vitae sem eget sapien vehicula lacinia eget vel quam.

    //                             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras lacinia consectetur sagittis. Duis lacinia viverra diam, in scelerisque orci interdum ac. Phasellus turpis lorem, ultricies sit amet nulla ut, pretium mollis risus. Duis eget sem ligula. Mauris vel enim vitae massa ultrices maximus at ac diam. Cras at euismod sem, eu ultrices ipsum.

    //                             Nam nec lorem nec augue molestie consequat. Maecenas ut consequat orci. Ut euismod consequat dui vestibulum lobortis. Maecenas varius, mauris in tincidunt elementum, dolor lacus rutrum ligula, ut vulputate odio felis non lectus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non elit suscipit, condimentum augue quis, eleifend lacus. Duis interdum nunc id dui gravida vehicula. Donec ac lacus nec lacus molestie pellentesque. Quisque aliquet arcu id ex lacinia porta. Vivamus ac sapien at neque gravida sagittis id ut nulla. Donec id finibus eros, quis consectetur felis. Suspendisse laoreet, sapien ac sodales pulvinar, nisi nunc pulvinar nulla, vel sollicitudin velit felis in felis. Fusce sed dolor quis orci tempus aliquet. Vivamus condimentum odio ac magna tincidunt, ut semper turpis eleifend. Pellentesque finibus dui sed aliquet auctor. Nam vehicula mollis fermentum.

    //                             <p className="fw-bold">Generated 5 paragraphs, 435 words, 2897 bytes of Lorem Ipsum</p>
    //                         </Card.Body>
    //                         <Card.Footer className="sticky-bottom bg-light">
    //                             <div className="d-flex align-items-center justify-content-center flex-wrap">
    //                                 <Button variant="danger" size="sm" className="mx-2" onClick={handleDisagree}>Disagree</Button>
    //                                 <Button variant="success" size="sm" className="mx-2" onClick={handleAgreement}>Agree</Button>
    //                             </div>
    //                         </Card.Footer>
    //                     </Card>
    //                 </Col>
    //             </Row>
    //             <ModalExtended
    //                 show={confirmation}
    //                 onHide={() => showConfirmation(false)}
    //                 title={"Consent Agreement"}
    //                 size={"md"}
    //             >
    //                 <Card className="shadow-none border-0 rounded-0">
    //                     <Card.Body className="text-center">
    //                         Are you sure you don't want to explore the chatbot?
    //                     </Card.Body>
    //                     <Card.Footer className="bg-transparent border-0">
    //                         <div className="d-flex align-items-center justify-content-center flex-wrap">
    //                             <Button variant="danger" size="sm" className="mx-2" onClick={redirectToGoogle}>Disagree</Button>
    //                             <Button variant="success" size="sm" className="mx-2" onClick={handleAgreement}>Agree</Button>
    //                         </div>
    //                     </Card.Footer>
    //                 </Card>
    //             </ModalExtended>
    //         </Container>
    //     </React.Fragment>
    // )
}
