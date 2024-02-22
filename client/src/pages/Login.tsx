import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { login, resetAuth } from "../features/auth/authSlice";
import { toast } from "react-hot-toast";
import Spinner from "../components/Spinner";

export interface LoginData {
    email: string;
    password: string;
}

function Login() {
    const [loginData, setLoginData] = useState<LoginData>({
        email: "",
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
    }, [successAuth, errorAuth, messageAuth, navigate, dispatch]);

    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;

        setLoginData((prevState) => {
            return {
                ...prevState,
                [name]: value
            }
        });
    }

    const onSubmit = (event: React.ChangeEvent<HTMLFormElement>): void => {
        event.preventDefault();
        dispatch(login(loginData));
        setLoginData({
            email: "",
            password: ""
        });
    }

    const handleDemoLogin = (): void => {
        dispatch(login({
            email: `${process.env.REACT_APP_DEMO_EMAIL}`,
            password: `${process.env.REACT_APP_DEMO_PASSWORD}`
        }));
    }

    return (
        <div className="auth">
            {loadingAuth ? (
                <Spinner />
            ) : (
                <div className="auth__content">
                    <div className="auth__content-heading__container">
                        <h1 className="auth__content-heading">
                            Welcome back!
                        </h1>
                        <p className="auth__content-message">
                            We're so excited to see you again!
                        </p>
                    </div>
                    <form onSubmit={onSubmit} className="auth__content-form">
                        <div className="auth__content-form__field">
                            <label htmlFor="email">EMAIL <span>*</span></label>
                            <input
                                required
                                type="email"
                                name="email"
                                id="email"
                                value={loginData.email}
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
                                value={loginData.password}
                                onChange={onChange}
                            />
                        </div>
                        <button className="auth__content-form__btn" type="submit">
                            Log In
                        </button>
                    </form>
                    <p className="auth__content-or">or</p>
                    <button onClick={handleDemoLogin} className="auth__content-demo">
                        Demo Account
                    </button>
                    <p className="auth__content-switch__container">
                        <p>
                            Need an account?
                        </p>
                        <Link to="/register" className="auth__content-switch">
                            Register
                        </Link>
                    </p>
                </div>
            )}
        </div>
    )
}

export default Login;