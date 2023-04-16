import React from "react"

import funder1 from "../../images/funder1.png"
import funder2 from "../../images/funder2.png"
import "./Funders.css"

const Funders = () => {
    return (
        <div>
            <div className="partners-container">
                <div className="header">
                    <h2 className="partner-heading">Our Funders</h2>
                </div>
                <div className="partners-list">
                    <div className="partner">
                        <a
                            href={"https://www.nserc-crsng.gc.ca/"}
                            target={"_blank"}
                            rel="noreferrer"
                        >
                            <img
                                src={funder1}
                                className="partner-logo"
                                alt="img missing"
                            />
                        </a>
                    </div>
                    <div className="mt-3 info-row" />
                    <div className="partner">
                        <a href={"https://cihr-irsc.gc.ca/e/193.html"} target={"_blank"} rel="noreferrer">
                            <img
                                src={funder2}
                                className="partner-logo"
                                alt="img missing"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Funders
