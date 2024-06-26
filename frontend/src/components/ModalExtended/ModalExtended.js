import React from "react"
import { Modal } from "react-bootstrap"

const ModalExtended = (props) => {
    return (
        <Modal
            {...props}
            size={props.size ?? "lg"}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                {props.title && (
                    <Modal.Title id="contained-modal-title-vcenter">
                        {props.title}
                    </Modal.Title>
                )}
            </Modal.Header>
            <Modal.Body>{props.children}</Modal.Body>
        </Modal>
    )
}

export default ModalExtended
