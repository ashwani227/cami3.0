import axios from "axios"
import { Notify } from "./Notify"

const AxiosInstance = axios.create({
    baseURL: "https://cami.med.ualberta.ca",
})

AxiosInstance.defaults.headers.common["Content-Type"] = "application/json"
AxiosInstance.defaults.headers.common["Accept"] = "application/json"
AxiosInstance.defaults.crossDomain = true

export const GetQuestionByNumber = async (questionNumber) => {
    try {
        return await AxiosInstance.get(
            `/chat/getQuestion?question=${questionNumber}`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const GetResources = async (entityResponse) => {
    try {
        return await AxiosInstance.post(`/chat/getResources`, entityResponse)
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const GetRelatedResources = async (condition = "") => {
    try {
        return await AxiosInstance.get(
            `/chat/getRelatedResources?condition=${condition}`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const SpellCheck = async (userResponse) => {
    try {
        return await AxiosInstance.get(
            `/check_response?function_call=checkSpelling&user_response=${userResponse}`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const GetEntities = async (userResponse) => {
    try {
        return await AxiosInstance.get(
            `/chat/getEntities?userResponse=${userResponse}`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const ShareResources = async (email, sharedURL) => {
    try {
        return await AxiosInstance.post(`/chat/shareResource`, {
            email: email,
            resource: sharedURL,
        })
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const SendResources = async (phoneNumber, sharedURL) => {
    try {
        return await AxiosInstance.post(`/chat/sendText`, {
            phoneNumber: phoneNumber,
            resource: sharedURL,
        })
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}

export const ReportProblem = async (session_id, message, screenshot) => {
    try {
        const formData = new FormData()
        formData.append("session_id", session_id)
        formData.append("report_message", message)
        formData.append("chat_file", screenshot)

        return await AxiosInstance.post(`/bug/report`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }
}


export const ShowTips = async () => {
    try {
        return await AxiosInstance.get(
            `/chat/checkResponse?function_call=showTips&user_response=`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }   
}

export const SavePhoneNumber = async (phoneNumber) => {
    try {
        return await AxiosInstance.get(
            `/chat/checkResponse?function_call=addSubscriber&user_response=${phoneNumber}`
        )
    } catch (error) {
        Notify(error.name + ": " + error.message, "error")
        console.error(error)
    }   
}