import React, { useLayoutEffect } from 'react';
import "./consent.scss";

const Consent = ({children}) => {

    useLayoutEffect(() => {

        let viewport = document.getElementsByName("viewport");
        if(viewport.length > 0) {
            viewport.forEach((item) => {
                item.setAttribute("content", "initial-scale=0.5")
            })
        }

        return () => {
            if(viewport.length > 0) {
                viewport.forEach((item) => {
                    item.setAttribute("content", "width=device-width, initial-scale=1")
                })
            }
        }

    }, [])

    return (
        <div className='page-bg'>
            <ConsentPage page={1}>
                <h3 className='text-center'>ONLINE CONSENT AND INFORMATION LETTER-PERSONAL ASSISTANT</h3>
                <p><span className="fw-bold">Study Title:</span> Canadian Network for Personalized Interventions in Intellectual Disability</p>
                <p className='mb-0'><span className="fw-bold">Principal Investigator:</span> Dr. Francois Bolduc, MD, PhD FRCPC	Ph: 780-492-9616</p>
                <p className='mb-0'><span className="fw-bold">Coordinator:</span> Ph: 780-492-7034</p>
                <hr className='mt-0 bg-dark' />

                <p>
                    You are being asked to help develop a novel tool for providing information about neurodevelopmental disability (NDD) to help improve access to personalized information and coaching for NDD.
                </p>
                <p>
                    Dr. Bolduc’s team has put together a computer program known as CAMI chatbot to help parents and professionals identify resources relevant to individuals with neurodevelopment disorders. Now we would like you to assess the prototype, report issues/bugs, identify issues with it and things we may need to improve in the future. You will be able to spend as little as 3 minutes or can browse for as long as you want to identify resources you find useful and identify any issues/bugs.
                </p>
                <p>
                    We will record the comments you make, the issues/bugs you report and will ask you to answer some questions at the end about the chatbot and your satisfaction with it.
                </p>
                <p>
                    Before you agree to participate in this project, please take the time to read the following consent form and make sure you understand its contents.
                </p>

                <p className="fw-bold">
                    Purpose and Background 
                </p>
                <p>
                    The main purpose of the study is to find new ways to improve access to services and information for individuals with intellectual disability and their families. This research study is sponsored by the Kids Brain Health Network (KBHN).
                </p>
                
                <p className="fw-bold">
                    What will I be asked to do?
                </p>
                <p>
                    You will be asked to provide your email and create a password if you want. You will also be able to use the chatbot without providing that information if you prefer. Your interaction with the personal assistant will depend on the questions you ask and if the topic is covered in our database. You may therefore spend as little as 3 minutes or can browse for as long as you want. You will be able to use the personal assistant as much as you want during the duration of the study. You will be asked for information about you and the individual you are looking for information about intervention for. This will the personal assistant to provide the most specific information possible. You may be asked to rate the suggestions provided by the chatbot on a scale of 1-5 stars from not useful to very useful. You will also be asked to complete The Chatbot Usability Questionnaire (CUQ).
                </p>
            </ConsentPage>
            <ConsentPage page={2}>
                
                <p className="fw-bold">
                    Possible Benefits and Risk.
                </p>
                <p>
                    You may not get any benefit from your participation in this study. In the long term, this study may help families with NDD, healthcare providers or educators in the future, by providing a better understanding of the factors implicated in NDD, and better interventions may be discovered.
                </p>
                <p>
                    It is not possible to know all of the risks that may happen in a study, but the researchers have taken all reasonable safeguards to minimize any known risks to a study participant. You can decide to withdraw from the study and request your information to be deleted at any time by emailing the study team.
                </p>
                
                <p className="fw-bold">
                    Confidentiality
                </p>
                <p>
                    During the study we will be collecting information about you and the individual you are obtaining information about intervention for (first name for personalization and in case you are asking about more than 1 individual), your location, the age, sex, challenging behaviors and potential triggers experienced by the individual you are searching for. We will not request any medical identification number.
                </p>
                <p>
                    The information gathered by the personal assistant will be stored in an encrypted database. We will do everything we can to make sure that this data is kept private. We cannot guarantee absolute privacy. However, we will make every effort to make sure that the information is kept private. The information will be available to our study team only and will not be visible to other participants.
                </p>
                <p>
                    You will have the possibility to communicate any question by contacting the study coordinator either by phone or email (without including confidential information).  In some cases, we may obtain or already have your name for other aspect of our study. This will be stored on our password protected computers.
                </p>
                <p>
                    During research studies it is important that the data we get are accurate. For this reason the information collected about the user and the individual for whom they are using the chatbot, may be looked at by the University of Alberta auditors or the University of Alberta Health Research Ethics Board. The sponsor (Kids Brain Health Network) will not have access to personal information that could identify you or your child directly.
                </p>
                <p>
                    After the study is done, we will still need to securely store the data collected as part of the study. At the University of Alberta, we keep data stored for a minimum of 5 years after the end of the study.
                </p>
                
                <p>
                    <span className="fw-bold">Reimbursement:</span> You will not be paid to participate to this component of the study. The rights to the commercial products will belong to the sponsor, collaborators or future unknown researchers.
                </p>
                
            </ConsentPage>
            <ConsentPage page={3}>
                <p>
                    <span className="fw-bold">Participating:</span> Participation is voluntary and should you choose to participate, you can withdraw at any time. If you leave the study, we will not collect new information and you can request us to remove the information already collected.
                </p>
                <p>
                    <span className="fw-bold">Questions:</span> If you have any questions or would like to participate in this study please contact the study coordinator by contacting 780-492-7034.
                </p>
                <p>
                    If you have any questions regarding your rights as a research participant, you may contact the Health Research Ethics Board at reoffice@ualberta.ca. This office is independent of the study investigators.
                </p>
                <hr className='bg-dark' />
                <p>
                    Please read the following statement:
                </p>
                <ol>
                    <li>Do you understand that you have been asked to be in a research study?</li>
                    <li>Have you read the Information above the study above mentioned?</li>
                    <li>Do you understand the benefits and risks involved in taking part in this research study? </li>
                    <li>Do you acknowledge you have the information to contact us for any questions? You can contact the study coordinator for any questions at 780-492-7034.</li>
                    <li>Do you understand that you are free to leave the study at any time without having to give us a reason?</li>
                    <li>Do you understand who will access to this information you provide?</li>
                </ol>
                {children}
            </ConsentPage>
        </div>
    );
};

const ConsentPage = ({ children, page = 1 }) => {
    return (
        <div id='page'>
            <main className='d-flex align-items-center justify-content-between'>
                <div className='brand-logo'></div>
                <p className='fw-bold m-0'>Department of Pediatrics</p>
            </main>
            <section>
                <article className='text-body'>
                    {children}
                </article>
            </section>
            <footer className='position-absolute bottom-0'>
                <div className="d-flex align-items-center justify-content-between small">
                    <span>1 September 2022</span> 	<span>Pro00081113</span> <span>{page}</span>
                </div>
            </footer>
        </div>
    )
}

export default Consent;