import React from "react"
import { Link } from "react-router-dom"
import robot from '../../images/robot.png';

const Footer = () => {
    return (
        <div className="Footer">
            <div className="FooterColumn">
                <img
                    className="FooterLogo"
                    src={robot}
                    width={125}
                    alt="Brand Logo"
                />
            </div>
            <div className="FooterColumn">
                <p className="ColumnHeading">Partners</p>
                <ul className="ColumnList">
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            CASDA
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            AMII
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            CHILD BRIGHT
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            AIDE CANADA
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            KBHN
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            WCHRI
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="FooterColumn">
                <p className="ColumnHeading">Funders</p>
                <ul className="ColumnList">
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            NSERC
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            CIHR
                        </Link>
                    </li>
                </ul>
            </div>
            <div className="FooterColumn">
                <p className="ColumnHeading">Organizations</p>
                <ul className="ColumnList">
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            University of Alberta
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            University of Calgary
                        </Link>
                    </li>
                    <li className="ColumnListItem">
                        <Link className="ListItemLink" to="/">
                            McGill University
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Footer
