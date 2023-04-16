import React, { useState } from "react"
import { Button, Container, Dropdown, Navbar, NavItem } from "react-bootstrap"
import { Link, NavLink } from "react-router-dom"
import html2canvas from "html2canvas"

import useAuthContext from "../../hooks/useAuthContext"
import { getJpegBlob } from "./screenshot"
import { Notify } from "../../helper/Notify"

import brand from "../../images/brand.png"
import Report from "../Report/Report"
import "./Navbar.css"

const BugIcon = ({ color = "black" }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={color} className="ms-1">
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"/>
            <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"/>
        </svg>
    )
}

const NavigationBar = () => {
    const { logout, isLogin } = useAuthContext()
    const [modalShow, setModalShow] = useState(false)
    const [screenshot, setScreenshot] = useState()

    const handleBugReport = () => {

        let text = "To help us in investigating the issue we would like to take a screenshot of webpage.\nIf you that's alright kindly click 'Okay'";
        if (window.confirm(text) === true) {
            // take the screenshot
            try {
                html2canvas(document.querySelector("#root"))
                    .then(async function (canvas) {
                        var base64URL = canvas
                            .toDataURL("image/jpeg")
                            .replace("image/jpeg", "image/octet-stream")

                        var screenshotJpegBlob = await getJpegBlob(canvas)
                        if (screenshotJpegBlob) {
                            console.log(screenshotJpegBlob)
                            setScreenshot({
                                data: screenshotJpegBlob,
                                content: base64URL,
                                screenshot: true
                            })
                            setModalShow(true)
                        }
                    })
                    .catch((err) => {
                        console.error(err)
                        Notify(`Unable to capture screenshot!`, "error")
                    })
            } catch (error) {
                console.error(error)
                Notify(`${error.name}: ${error.message}`, "error")
            }   
        } else {
            setScreenshot({
                data: null,
                content: "",
                screenshot: false
            })

            setModalShow(true)
        }
    }

    const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
        <button
            ref={ref}
            onClick={(e) => {
                e.preventDefault()
                onClick(e)
            }}
            className="menu-trigger"
        >
            {children}
            <span className="navbar-toggler-icon"></span>
        </button>
    ))

    const CustomMenu = React.forwardRef(
        ({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
            return (
                <div
                    ref={ref}
                    style={style}
                    className={`${className} menu active`}
                    aria-labelledby={labeledBy}
                >
                    {children}
                </div>
            )
        }
    )

    return (
        <Navbar
            collapseOnSelect
            fixed={"top"}
            expand={false}
            className="bg-white"
        >
            <Container>
                <NavLink to="/home">
                    <img
                        src={brand}
                        alt="brand"
                        className="img-fluid"
                        width={100}
                    />
                </NavLink>
                <NavItem>
                    <Button
                        variant="outline-light"
                        className="text-danger mx-auto btn-sm border-0"
                        onClick={handleBugReport}
                    >
                        Report a bug <BugIcon color={"#dc3545"} />
                    </Button>
                </NavItem>
                <React.Fragment>
                    <Dropdown>
                        <Dropdown.Toggle
                            as={CustomToggle}
                            id="custom-dropdown-cami"
                        />
                        <Dropdown.Menu as={CustomMenu}>
                            <Dropdown.Item
                                eventKey="1"
                                className="nav-item"
                                as={Link}
                                to="/home"
                            >
                                Home
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="2"
                                className="nav-item"
                                as={Link}
                                to="/about"
                            >
                                About us
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="3"
                                className="nav-item"
                                as={Link}
                                to="/partners"
                            >
                                Partners
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="4"
                                className="nav-item"
                                as={Link}
                                to="/funders"
                            >
                                Funders
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="5"
                                className="nav-item"
                                as={Link}
                                to="/organizations"
                            >
                                Organizations
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="6"
                                className="nav-item"
                                target="_blank"
                                rel="noopener"
                                href="https://nddportal.med.ualberta.ca/chatbotportal/app/resource_submit"
                            >
                                Submit a Resource
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey="6"
                                className="nav-item"
                                target="_blank"
                                rel="noopener"
                                href="https://nddportal.med.ualberta.ca/chatbotportal/app"
                            >
                                View all Resources
                            </Dropdown.Item>
                            {isLogin ? (
                                <React.Fragment>
                                    <Dropdown.Item
                                        eventKey="7"
                                        className="nav-item"
                                        as={Link}
                                        to="/profile"
                                    >
                                        Profile
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        eventKey="8"
                                        className="nav-item"
                                        as={Link}
                                        to="/login"
                                        onClick={() => logout()}
                                    >
                                        Logout
                                    </Dropdown.Item>
                                </React.Fragment>
                            ) : (
                                <Dropdown.Item
                                    eventKey="9"
                                    className="nav-item"
                                    as={Link}
                                    to="/login"
                                >
                                    Sign in
                                </Dropdown.Item>
                            )}
                        </Dropdown.Menu>
                    </Dropdown>
                </React.Fragment>
                <Report
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    screenshot={screenshot}
                />
            </Container>
        </Navbar>
    )
}

export default NavigationBar
