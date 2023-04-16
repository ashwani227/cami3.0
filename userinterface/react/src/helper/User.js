import axios from "axios";

const AxiosInstance = axios.create({
    baseURL: 'https://cami.med.ualberta.ca'
});

AxiosInstance.defaults.headers.common['Content-Type'] = 'application/json';
AxiosInstance.defaults.headers.common['Accept'] = 'application/json';
AxiosInstance.defaults.crossDomain = true;

export const UserProfile = async (user_email) => {

    try {
        return await AxiosInstance.get(`/api/profile_app/getProfile?email=${user_email}`);
    } catch (error) {
        console.error(error);
    }

    // return await fetch(`${baseURL}/profile_app/getProfile?email=${user_email}`)
    //     .then(response => {
    //         return response.json();
    //     }).catch(error => {
    //         console.error(error);
    //     });
}

export const SaveResources = async (user_email, resource_name_url) => {

    try {
        return await AxiosInstance.get(`/api/profile_app/saveResource?email=${user_email}&resource=${resource_name_url}`);
    } catch (error) {
        console.error(error);
    }

    // return await fetch(`${baseURL}/profile_app/saveResource?email=${user_email}&resource=${resource_name_url}`)
    //     .then(response => {
    //         return response.json();
    //     }).catch(error => {
    //         console.error(error);
    //     });
}
