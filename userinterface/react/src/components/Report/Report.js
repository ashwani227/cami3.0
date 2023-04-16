import React, { useState } from "react"
import { Form } from "react-bootstrap"
import { ReportProblem } from "../../helper/Chat"

import { Notify } from "../../helper/Notify"
import ModalExtended from "../ModalExtended/ModalExtended"

const Report = ({ modalShow, setModalShow, screenshot = undefined }) => {
    const [detail, setDetails] = useState("")
    const [disabled, setDisabled] = useState(false)
    const [viewScreenshot, openScreenshot] = useState(false)

    const handleSubmit = (event) => {
        event.preventDefault()
        event.stopPropagation()

        setDisabled(true)

        if (!screenshot) {
            Notify("Unable to process your request please try again", "error")
            setDisabled(false)
            setModalShow(false)
            return
        }

        const session_id = Math.round(new Date().getTime() / 1000)

        ReportProblem(session_id, detail, screenshot?.data)
            .then((response) => {
                setDisabled(false)
                setModalShow(false)
                console.log(response)
                Notify("Bug Reported Successfully!", "success")
            })
            .catch((err) => {
                console.error(err.response)
                setDisabled(false)
                Notify(
                    "Unable to process your request. Please try again later thank you!",
                    "error"
                )
            })
    }

    const handleBugDetails = (event) => {
        const text = event.target.value
        setDetails(text)
    }
    
    return (
        <div className="container">
            <ModalExtended
                show={modalShow}
                onHide={() => setModalShow(false)}
                title={"Send Bug Report"}
            >
                <div className="row gx-0">
                    <div className="col-12">
                        <React.Fragment>
                            {(screenshot?.data && screenshot?.screenshot) && (
                                <h5 className="text-success fw-bold">
                                    A screenshot has been captured of your
                                    screen{" "}
                                    <span
                                        className="text-decoration-underline text-primary small"
                                        onClick={() =>
                                            openScreenshot(!viewScreenshot)
                                        }
                                        style={{
                                            cursor: "pointer",
                                        }}
                                    >
                                        view
                                    </span>
                                </h5>
                            )}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group
                                    md="4"
                                    controlId="validationCustom01"
                                >
                                    <Form.Label>
                                        Would you like to add any other details?
                                    </Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        placeholder="(optional)"
                                        onChange={handleBugDetails}
                                        rows={3}
                                    />
                                </Form.Group>
                                <button
                                    className="mt-3 me-2 btn btn-outline-secondary btn-sm"
                                    type="reset"
                                    onClick={() => {
                                        setModalShow(false)
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    className="mt-3 me-2 btn btn-primary btn-sm"
                                    disabled={disabled || !screenshot}
                                    type="submit"
                                >
                                    Send
                                </button>
                            </Form>
                        </React.Fragment>
                    </div>
                </div>
            </ModalExtended>

            {screenshot?.screenshot && (
                <ModalExtended
                    show={viewScreenshot}
                    size={"xl"}
                    onHide={() => openScreenshot(false)}
                >
                    <div className="row gx-0">
                        <div className="col-12 text-center">
                            <img
                                src={screenshot?.content}
                                className="img-fluid"
                                alt="screenshot preview"
                            />
                        </div>
                    </div>
                </ModalExtended>
            )}
        </div>
    )
}

export default Report
