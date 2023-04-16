export const FindKeyValue = (key, keyValue, list) => {
    for (let i = 0; i < list.length; i++) {
        const item = list[i]

        for (const key of Object.keys(item)) {
            //check if its array of more options, search it
            if (Array.isArray(item[key])) {
                const res = FindKeyValue(key, keyValue, item[key])
                if (res.found === true) return res
            }
            //Test the keyValue
            else if (item[key] === keyValue) {
                //found, return the list
                return { found: true, containingArray: list }
            }
        }
    }

    return { found: false, containingArray: [] }
}

export const ErrorHandling = (error) => {
    let APIError =
        "Something went wrong, unable to initiate your request! Please check console for more information"
    if (error?.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx

        const data = error?.response?.data
        const status = error?.response?.status

        if (
            data &&
            !(Object.keys(data).length === 0 && data.constructor === Object)
        ) {
            if (data.detail && data.detail !== "") {
                APIError = data.detail
            } else if (data.description && data.description !== "") {
                APIError = data.description
            } else if (data.error && data.error !== "") {
                APIError = data.error
            } else if (data.email && data.email !== "") {
                APIError = data.email
            } else if (data.username && data.username !== "") {
                APIError = data.username
            } else if (data.password && data.password !== "") {
                APIError = data.password
            }

            console.error(
                error?.response?.data || APIError,
                "Status Code: " + status
            )
        }
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        APIError =
            error?.request?.responseText || error?.response || "Request Failed! Check your Network Connection"
        console.error("No Response Data Received", APIError)
    } else {
        // Something happened in setting up the request that triggered an Error
        APIError = error?.message || "Unable to process the request!"
        console.error("Request Error", APIError)
    }

    // console.error("Details: ", error?.response || error)
    return APIError
}

export const isJson = (item) => {
    item = typeof item !== "string" ? JSON.stringify(item) : item

    try {
        item = JSON.parse(item)
    } catch (e) {
        return false
    }

    if (typeof item === "object" && item !== null) {
        return true
    }

    return false
}

export const validateNumber = (event) => {
    
    const keyCode = event.keyCode
    const ctrlKeyCode = event.ctrlKey
    const metaKeyCode = event.metaKey
    const shiftKeyCode = event.shiftKey

    
    if (
        [46, 8, 9, 27, 13].indexOf(keyCode) !== -1 ||
        //Allow plus character
        (shiftKeyCode && keyCode === 187) || keyCode === 107 ||
        // Allow: Ctrl+A
        (keyCode === 65 && (ctrlKeyCode || metaKeyCode)) ||
        // Allow: Ctrl+C
        (keyCode === 67 && (ctrlKeyCode || metaKeyCode)) ||
        // Allow: Ctrl+V
        (keyCode === 86 && (ctrlKeyCode || metaKeyCode)) ||
        // Allow: Ctrl+X
        (keyCode === 88 && (ctrlKeyCode || metaKeyCode)) ||
        // Allow: home, end, left, right
        (keyCode >= 35 && keyCode <= 39)
    ) {
        // let it happen, don't do anything
        return
    }

    // Ensure that it is a number and stop the keypress
    if (
        (shiftKeyCode || keyCode < 48 || keyCode > 57) &&
        (keyCode < 96 || keyCode > 105)
    ) {
        event.preventDefault()
    }
}
