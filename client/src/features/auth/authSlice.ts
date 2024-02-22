import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import authService from "./authService";
import { AuthState, AuthUser, IUser } from "./authInterface";
import { RegisterData } from "../../pages/Register";
import { LoginData } from "../../pages/Login";
import { toast } from "react-hot-toast";
import { ProfileData } from "../../pages/ProfileSettings";
import { RootState } from "../../app/store";
import { checkTokenValidity } from "../../reusable";

const user: string | null = localStorage.getItem("user");

const initialState: AuthState = {
    user: user ? JSON.parse(user) : null,
    loadingAuth: false,
    loadingAuthEdit: false,
    successAuth: false,
    errorAuth: false,
    messageAuth: ""
}

// POST
export const register = createAsyncThunk("auth/register", async (data: RegisterData, thunkAPI) => {
    try {
        return await authService.register(data);
    } catch (error: any) {
        const message: string = error.response.data.error;
        return thunkAPI.rejectWithValue(message);
    }
});

export const login = createAsyncThunk("auth/login", async (data: LoginData, thunkAPI) => {
    try {
        return await authService.login(data);
    } catch (error: any) {
        const message: string = error.response.data.error;
        return thunkAPI.rejectWithValue(message);
    }
});

// PUT
export const editProfile = createAsyncThunk("auth/edit-profile", async (data: ProfileData, thunkAPI) => {
    try {
        const token: string | null = (thunkAPI.getState() as RootState).auth.user?.token ?? null;
        return await authService.editProfile(data, token);
    } catch (error: any) {
        const message: string = error.response.data.error;
        if (!checkTokenValidity(error)) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        resetAuth: (state) => {
            state.successAuth = false;
            state.errorAuth = false;
            state.messageAuth = "";
        },
        logout: (state) => {
            localStorage.removeItem("user");
            state.user = null;
            document.location.href = "/login";
        }
    },
    extraReducers: (builder) => {
        builder
            // POST
            .addCase(register.pending, (state) => {
                state.loadingAuth = true;
            })
            .addCase(register.fulfilled, (state, action: PayloadAction<AuthUser>) => {
                state.loadingAuth = false;
                state.user = action.payload;
                state.successAuth = true;
                toast.success("Account Registered!")
            })
            .addCase(register.rejected, (state, action: PayloadAction<any>) => {
                state.loadingAuth = false;
                state.errorAuth = true;
                state.messageAuth = action.payload;
            })
            .addCase(login.pending, (state) => {
                state.loadingAuth = true;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<AuthUser>) => {
                state.loadingAuth = false;
                state.user = action.payload;
                state.successAuth = true;
                toast.success("Login Successful!");
                
            })
            .addCase(login.rejected, (state, action: PayloadAction<any>) => {
                state.loadingAuth = false;
                state.errorAuth = true;
                state.messageAuth = action.payload;
            })
            // PUT
            .addCase(editProfile.pending, (state) => {
                state.loadingAuthEdit = true;
            })
            .addCase(editProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
                state.loadingAuthEdit = false;
                const prevUserData: AuthUser = JSON.parse(localStorage.getItem("user") as string);
                const updatedUserData: AuthUser = {
                    ...action.payload,
                    token: prevUserData.token
                }

                localStorage.setItem("user", JSON.stringify(updatedUserData));
                state.user = updatedUserData;
                toast.success("Profile Updated!");
            })
            .addCase(editProfile.rejected, (state, action: PayloadAction<any>) => {
                state.loadingAuthEdit = false;
                toast.error(action.payload);
            })
    }
});

export const { resetAuth, logout } = authSlice.actions;
export default authSlice.reducer;