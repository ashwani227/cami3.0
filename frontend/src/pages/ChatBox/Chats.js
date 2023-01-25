import React, { useState } from 'react';

const Chats = ({ question, children, entity }) => {
    const [UserQuery] = useState(entity["userQueryMeaning"] || "")

    return (
        <React.Fragment>
            {
                question.map((obj, i) => {

                    let text = Object.values(obj)[0]
                    if (UserQuery && UserQuery !== "" && text.includes("$userQueryMeaning")) {
                        text = text.replace("$userQueryMeaning", UserQuery)
                    }

                    return (
                        <div className="row gx-0 align-items-center justify-content-start chat-history" key={i}>
                            <div className='col-12 mt-2 mb-2'>
                                <div className='question w-100 mb-0' style={{
                                    padding: "5px 10px"
                                }}>
                                    <p> {text} </p>
                                </div>
                            </div>
                        </div>
                    );
                })
            }

            {children}
        </React.Fragment>
    );
};

export default Chats;