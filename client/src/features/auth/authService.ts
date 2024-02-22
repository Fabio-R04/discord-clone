import axios from "axios";
import { URL, getConfig } from "../../reusable";
import { RegisterData } from "../../pages/Register";
import { AuthUser, IUser } from "./authInterface";
import { LoginData } from "../../pages/Login";
import { ProfileData } from "../../pages/ProfileSettings";

// POST
const register = async (data: RegisterData): Promise<AuthUser> => {
    const response = await axios.post(
        `${URL}/auth/register`,
        data,
        undefined
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
}

const login = async (data: LoginData): Promise<AuthUser> => {
    const response = await axios.post(
        `${URL}/auth/login`,
        data,
        undefined
    );

    if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
}

// PUT
const editProfile = async (data: ProfileData, token: string | null): Promise<IUser> => {
    const { removeImage, displayName, pronouns, bannerColor, aboutMe, file } = data;

    const formData: FormData = new FormData();
    formData.append("removeImage", removeImage.toString());
    if (displayName) formData.append("displayName", displayName);
    if (pronouns) formData.append("pronouns", pronouns);
    if (bannerColor) formData.append("bannerColor", bannerColor);
    if (aboutMe) formData.append("aboutMe", aboutMe);
    if (file) formData.append("file", file);

    const response = await axios.put(
        `${URL}/auth/edit-profile`,
        formData,
        getConfig(token)
    );

    return response.data;
}

const authService = {
    register,
    login,
    editProfile
}

export default authService;