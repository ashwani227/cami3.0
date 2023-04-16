import React from "react"
import partner1 from "../../images/partner1.png"
import partner2 from "../../images/partner2.png"
import partner3 from "../../images/partner3.png"
import partner4 from "../../images/partner4.png"
import partner5 from "../../images/partner5.png"
import partner6 from "../../images/partner6.png"

const Partners = () => {
    const partners = [
        {
            id: 1,
            image: partner1,
            link: "https://www.autismalliance.ca/",
        },
        {
            id: 2,
            image: partner2,
            link: "https://www.amii.ca/",
        },
        {
            id: 3,
            image: partner3,
            link: "https://www.child-bright.ca/",
        },
        {
            id: 4,
            image: partner4,
            link: "https://aidecanada.ca/",
        },
        {
            id: 5,
            image: partner5,
            link: "https://kidsbrainhealth.ca/",
        },
        {
            id: 6,
            image: partner6,
            link: "https://www.wchri.org/",
        },
    ]
    return (
        <div>
            <div className="partners-container">
                <div className="header">
                    <h2 className="partner-heading">Our Partners</h2>
                </div>
                <div className="partners-list">
                    {partners.map((partner, index) => (
                        <div key={index} className="text-center">
                            <div className="partner">
                                <a
                                    href={partner.link}
                                    target={"_blank"}
                                    rel="noreferrer"
                                >
                                    <img
                                        src={partner.image}
                                        className="partner-logo"
                                        alt="img missing"
                                    />
                                </a>
                            </div>
                            {
                                index !== (partners.length - 1) && (
                                    <div className="info-row" />
                                )
                            }
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Partners
