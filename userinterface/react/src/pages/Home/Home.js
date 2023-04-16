import React, { useEffect } from "react"
import { Link } from "react-router-dom"

import { Footer } from "../../components"

import useAuthContext from "../../hooks/useAuthContext"

import trust from "../../images/Vector.png"
import save from "../../images/save.png"
import share from "../../images/share_icon.png"
import hero from "../../images/home_page.jpeg"
// import hero from "../../images/hero-image.svg"

import org1 from "../../images/org1.png"
import org2 from "../../images/org2.png"
import org3 from "../../images/org3.png"

import cami_video from "../../videos/CAMI.mp4"

import "./Home.css"

const Home = () => {
    const { logout, isLogin } = useAuthContext()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="HomePage container">
            <div className="HeroSection">
                <div className="HeroLeft">
                    <h1 className="HeroHeading">
                        Chat about neuro developmental differences and get
                        resources based on your needs.
                    </h1>
                    <p className="HeroText">
                        I am here to help you save time and answer your
                        questions about <u>developmental differences.</u>{" "}
                    </p>
                    <div className="HeroButtons">
                        <Link
                            className="btn btn-primary btn-lg HeroPrimaryButton"
                            to="/chatBox"
                        >
                            Chat Now
                        </Link>
                        {isLogin ? (
                            <button
                                className="btn btn-outline-primary HeroSecondaryButton"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                className="btn btn-outline-primary HeroSecondaryButton"
                                to="/signup"
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>
                </div>
                <div className="HeroRight">
                    <img className="HeroImage" src={hero} alt="img missing" />
                </div>
            </div>

            <div className="OrganizationSection">
                <h1 className="OrganizationHeading">
                    <span>Our Organizations</span>
                </h1>
                <div className="Organizations">
                    <div className="Organization">
                        <div className="OrganizationTop">
                            <a href={"https://www.ualberta.ca/index.html"} target={'_blank'} rel="noreferrer">    
                                <img
                                    className="OrganizationIcon"
                                    src={org1}
                                    alt="img missing"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="Organization">
                        <div className="OrganizationTop">
                            <a href={"https://www.ucalgary.ca/"} target={'_blank'} rel="noreferrer">    
                                <img
                                    className="OrganizationIcon"
                                    src={org2}
                                    alt="img missing"
                                />
                            </a>
                        </div>
                    </div>
                    <div className="Organization">
                        <div className="OrganizationTop">
                            <a href={"https://www.mcgill.ca/"} target={'_blank'} rel="noreferrer">    
                                <img
                                    className="OrganizationIcon"
                                    src={org3}
                                    alt="img missing"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="FeatureSection">
                <h1 className="FeatureHeading">
                    <span>Our Features</span>
                </h1>
                <div className="Features">
                    <div className="Feature">
                        <div className="FeatureTop">
                            <img
                                className="FeatureIcon"
                                src={trust}
                                alt="img missing"
                            />
                            <p className="FeatureNumber">01</p>
                        </div>
                        <p className="FeatureName">Trusted Resources</p>
                        <p className="FeatureText">
                            From expert parents, educators, and health
                            professionals.
                        </p>
                    </div>
                    <div className="Feature">
                        <div className="FeatureTop">
                            <img
                                className="FeatureIcon"
                                src={save}
                                alt="img missing"
                            />
                            <p className="FeatureNumber">02</p>
                        </div>
                        <p className="FeatureName">Save</p>
                        <p className="FeatureText">
                            Your findings and build your own library.
                        </p>
                    </div>
                    <div className="Feature">
                        <div className="FeatureTop">
                            <img
                                className="FeatureIcon"
                                src={share}
                                alt="img missing"
                                width="100"
                            />
                            <p className="FeatureNumber">03</p>
                        </div>
                        <p className="FeatureName">Share</p>
                        <p className="FeatureText">
                            Resources with your friends & family.
                        </p>
                    </div>
                </div>
            </div>

            <div className="OrganizationSection">
                <h1 className="OrganizationHeading">
                    <span>How it works</span>
                </h1>
                <video className="w-100" controls muted autoPlay>
                    <source src={cami_video} type="video/mp4" />
                    <source src={cami_video} type="video/ogg" />
                    Your browser does not support the video tag.
                </video>
            </div>
            <Footer />
        </div>
    )
}

export default Home
