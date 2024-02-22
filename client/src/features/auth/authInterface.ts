export interface IUser {
    _id: string;
    displayName: string;
    username: string;
    email: string;
    pronouns: string;
    bannerColor: string;
    aboutMe: string;
    hasProfilePicture: {
        present: boolean;
        color: string;
        image: string;
    };
    createdAt: Date;
}

export interface AuthUser extends IUser {
    token: string;
}

export interface AuthState {
    user: AuthUser | null;
    loadingAuth: boolean;
    loadingAuthEdit: boolean;
    successAuth: boolean;
    errorAuth: boolean;
    messageAuth: string;
}