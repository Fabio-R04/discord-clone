import { AxiosError } from "axios";

export const URL: string = `${process.env.REACT_APP_SERVER_URL}`;

export const getConfig = (token: string | null) => {
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
}

export const checkTokenValidity = (error: AxiosError): boolean => {
    if (error.response?.status === 403) {
        return false;
    }
    return true;
}