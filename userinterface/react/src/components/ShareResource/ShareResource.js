import React, { useState } from "react"
import { Form } from "react-bootstrap"
import { SendResources, ShareResources } from "../../helper/Chat"

import { Notify } from "../../helper/Notify"
import ModalExtended from "../ModalExtended/ModalExtended"

const ShareResource = ({ modalShow, setModalShow, shareableLink = "" }) => {
    const [validated, setValidated] = useState(false)
    const [checked, setChecked] = useState(false)

    const defaultValues = {
        phone: "",
        email: "",
    }

    const [receiverDetails, setReceiverDetail] = useState(defaultValues)

    const [disabled, setDisabled] = useState(true)
    const emailRegex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    const phoneRegex =
        /(\+\d{1,3}\s?)?((\(\d{3}\)\s?)|(\d{3})(\s|-?))(\d{3}(\s|-?))(\d{4})(\s?(([E|e]xt[:|.|]?)|x|X)(\s?\d+))?/g

    React.useEffect(() => {
        setReceiverDetail({
            phone: "",
            email: ""
        })
        setDisabled(true)
        setValidated(false)
    }, [checked])

    const handleSubmit = (event) => {
        event.preventDefault()
        event.stopPropagation()

        setValidated(true)
        if (
            receiverDetails.email !== "" &&
            emailRegex.test(receiverDetails.email)
        ) {
            setDisabled(true)
            ShareResources(receiverDetails.email, shareableLink)
                .then((response) => {
                    setDisabled(false)
                    if (response && response.data) {
                        setModalShow(false)
                        setChecked(false)

                        Notify(
                            "Resource has been shared successfully!",
                            "success"
                        )
                    }
                })
                .catch((err) => {
                    Notify(
                        "Unable to process your request. Please try again later thank you!",
                        "error"
                    )
                    setDisabled(false)
                })
        } else if (
            receiverDetails.phone !== "" &&
            phoneRegex.test(receiverDetails.phone)
        ) {
            setDisabled(true)
            SendResources(receiverDetails.phone, shareableLink)
                .then((response) => {
                    setDisabled(false)
                    if (response && response.data) {
                        setModalShow(false)
                        setChecked(false)

                        Notify(
                            "Resource has been shared successfully!",
                            "success"
                        )
                    }
                })
                .catch((err) => {
                    Notify(
                        "Unable to process your request. Please try again later thank you!",
                        "error"
                    )
                    setDisabled(false)
                })
        } else {
            if (checked) {
                Notify("Please provide a valid phone number!", "error")
            } else {
                Notify("Please provide a valid email!", "error")
            }
        }
    }

    const validateInput = (event, input) => {
        const text = event.target.value
        if (input === "phone") {
            setReceiverDetail({
                phone: text,
            })

            if (text) {
                setDisabled(!phoneRegex.test(text))
                return
            }
        } else if (input === "email") {
            setReceiverDetail({
                email: text,
            })

            if (text) {
                setDisabled(!emailRegex.test(text))
                return
            }
        }

        setDisabled(true)
    }

    const handleCopyClipboard = (event) => {
        navigator.clipboard.writeText(shareableLink)
        setModalShow(false)
        setChecked(false)
        Notify("Resource link copy to clipboard", "success")
    }

    return (
        <div className="container">
            <ModalExtended
                show={modalShow}
                onHide={() => setModalShow(false)}
                title={"Share Resource"}
            >
                <div className="row gx-0">
                    <div className="col-12">
                        <div className="d-flex align-items-center justify-content-center">
                            <label
                                htmlFor="toggle-share-switch"
                                className="me-3"
                            >
                                Send Email
                            </label>
                            <Form.Check
                                inline
                                type="switch"
                                id="toggle-share-switch"
                                defaultChecked={checked}
                                className="me-0"
                                onChange={() => setChecked(!checked)}
                            />
                            <label
                                htmlFor="toggle-share-switch"
                                className="ms-2"
                            >
                                Send Text Message
                            </label>
                        </div>
                        <Form
                            noValidate
                            validated={validated}
                            onSubmit={handleSubmit}
                        >
                            <Form.Group md="4" controlId="validationCustom01">
                                <Form.Label>
                                    {checked ? "Phone Number" : "Email"}
                                </Form.Label>
                                <Form.Control
                                    required
                                    type={checked ? "number" : "email"}
                                    placeholder={`Enter ${
                                        checked
                                            ? "phone number"
                                            : "email address"
                                    }`}
                                    onChange={(event) => {
                                        validateInput(
                                            event,
                                            checked ? "phone" : "email"
                                        )
                                    }}
                                    style={{ boxShadow: "none" }}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {checked
                                        ? receiverDetails.phone === ""
                                            ? "Please enter a phone number"
                                            : "Invalid Phone Number Provided!"
                                        : receiverDetails.email
                                        ? "Please enter an email address"
                                        : "Invalid Email Address"}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="d-flex align-items-center mt-3">
                                <button
                                    className="me-2 btn btn-outline-secondary btn-sm"
                                    type="reset"
                                    onClick={() => {
                                        setValidated(false)
                                        setModalShow(false)
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    className="me-2 btn btn-primary btn-sm"
                                    disabled={disabled}
                                    type="submit"
                                >
                                    Send
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-link btn-sm ms-auto"
                                    onClick={handleCopyClipboard}
                                >
                                    Copy Link
                                </button>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </ModalExtended>
        </div>
    )
}

export default ShareResource
