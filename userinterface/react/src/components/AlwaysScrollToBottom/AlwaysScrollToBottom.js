import React from 'react';

const AlwaysScrollToBottom = () => {
    const elementRef = React.useRef();
    React.useEffect(() => elementRef.current.scrollIntoView());
    return <div ref={elementRef} />;
};

export default AlwaysScrollToBottom;