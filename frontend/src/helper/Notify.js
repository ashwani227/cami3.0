import { toast } from "react-toastify"


const options = {
    position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
}

export const Notify = (message, type = undefined) => {
    switch (type) {
        case 'success':
            toast.success(message, options)
            break;
        case 'error':
            toast.error(message, options)
            break;
        case 'warning':
            toast.warn(message, options)
            break;
        case 'info':
            toast.info(message, options)
            break;
        default:
            toast(message, options)
            break;
    }
}