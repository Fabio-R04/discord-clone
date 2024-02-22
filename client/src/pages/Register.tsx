import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { register, resetAuth } from "../features/auth/authSlice";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";

export interface RegisterData {
    email: string;
    displayName: string;
    username: string;
    password: string;
}

function Register() {
    const [registerData, setRegisterData] = useState<RegisterData>({
        email: "",
        displayName: "",
        username: "",
        password: ""
    });
    const {
        loadingAuth,
        successAuth,
        errorAuth,
        messageAuth
    } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (successAuth) {
            navigate("/");
        }

        if (errorAuth) {
            toast.error(messageAuth);
        }

        dispatch(resetAuth());
    }, [successAuth, errorAuth, messageAuth, navigate, dispatch]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;

        setRegisterData((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        });
    }

    const onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        dispatch(register(registerData));
        setRegisterData({
            displayName: "",
            username: "",
            email: "",
            password: ""
        });
    }

    return (
        <div className="auth">
            
            {loadingAuth ? (
                <Spinner />
            ) : (
                <div className="auth__content">
                    <h1 className="auth__content-heading">
                        Create an account
                    </h1>
                    <form onSubmit={onSubmit} className="auth__content-form">
                        <div className="auth__content-form__field">
                            <label htmlFor="email">EMAIL <span>*</span></label>
                            <input
                                required
                                type="email"
                                name="email"
                                id="email"
                                value={registerData.email}
                                onChange={onChange}
                            />
                        </div>
                        <div className="auth__content-form__field">
                            <label htmlFor="display-name">DISPLAY NAME <span>*</span></label>
                            <input
                                required
                                type="text"
                                name="displayName"
                                id="display-name"
                                value={registerData.displayName}
                                onChange={onChange}
                            />
                        </div>
                        <div className="auth__content-form__field">
                            <label htmlFor="username">USERNAME <span>*</span></label>
                            <input
                                required
                                type="text"
                                name="username"
                                id="username"
                                value={registerData.username}
                                onChange={onChange}
                            />
                        </div>
                        <div className="auth__content-form__field">
                            <label htmlFor="password">PASSWORD <span>*</span></label>
                            <input
                                required
                                type="password"
                                name="password"
                                id="password"
                                value={registerData.password}
                                onChange={onChange}
                            />
                        </div>
                        <button className="auth__content-form__btn" type="submit">
                            Continue
                        </button>
                    </form>
                    <p className="auth__content-info">
                        By registering, you agree to Discord's <span>Terms of Service</span> and <span>Privacy Policy.</span>
                    </p>
                    <Link to="/login" className="auth__content-switch">
                        Already have an account?
                    </Link>
                </div>
            )}
        </div>
    )
}

export default Register;