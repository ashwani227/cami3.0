import React from "react"

import org1 from "../../images/org1.png"
import org2 from "../../images/org2.png"
import org3 from "../../images/org3.png"

import "./Organizations.css"

const Organizations = () => {
    return (
        <div>
            <div className="org-container">
                <div className="org-header">
                    <h2 className="org-heading">Our Organizations</h2>
                </div>
                <div className="org-list">
                    <div className="orgs">
                        <a
                            href={"https://www.ualberta.ca/index.html"}
                            target={"_blank"}
                            rel="noreferrer"
                        >
                            <img
                                src={org1}
                                className="partner-logo"
                                alt="img missing"
                            />
                        </a>
                        <div className="org-contact">
                            <div className="contact">
                                <a
                                    href={"http://www.bolduclab.com/page9.html"}
                                    target={"_blank"}
                                    className="contact-name"
                                    rel="noreferrer"
                                >
                                    Dr. Francois Bolduc
                                </a>
                                <p className="contact-pos">(Md Phd)</p>
                            </div>
                            <div className="contact">
                                <a
                                    href={"https://webdocs.cs.ualberta.ca/~zaiane/"}
                                    target={"_blank"}
                                    className="contact-name"
                                    rel="noreferrer"
                                >
                                    Dr. Osmar Zaine
                                </a>
                                <p className="contact-pos">(Phd)</p>
                            </div>
                        </div>
                    </div>
                    <div className="row" />
                    <div className="funder">
                        <a
                            href={"https://www.ucalgary.ca/"}
                            target={"_blank"}
                            rel="noreferrer"
                        >
                            <img
                                src={org2}
                                className="partner-logo"
                                alt="img missing"
                            />
                        </a>
                        <div className="org-contact">
                            <div className="contact">
                                <a
                                    href={"https://contacts.ucalgary.ca/info/sw/profiles/232-116"}
                                    target={"_blank"}
                                    className="contact-name"
                                    rel="noreferrer"
                                >
                                    Dr. David Nicholas
                                </a>
                                <p className="contact-pos">(Phd)</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-row" />
                    <div className="funder">
                        <a
                            href={"https://www.mcgill.ca/"}
                            target={"_blank"}
                            rel="noreferrer"
                        >
                            <img
                                src={org3}
                                className="partner-logo"
                                alt="img missing"
                            />
                        </a>
                        <div className="org-contact">
                            <div className="contact">
                                <a
                                    href={"https://www.mcgill.ca/spot/annette-majnemer"}
                                    target={"_blank"}
                                    className="contact-name"
                                    rel="noreferrer"
                                >
                                    Dr. Annette Majnemer
                                </a>
                                <p className="contact-pos">(Phd)</p>
                            </div>
                        </div>
                    </div>
                    <div className="row" />
                </div>
            </div>
        </div>
    )
}

export default Organizations
