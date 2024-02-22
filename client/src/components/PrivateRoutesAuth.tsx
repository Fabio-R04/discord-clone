import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

function PrivateRoutesAuth() {
    const { user } = useAppSelector((state) => state.auth);

    if (user) {
        return <Navigate to="/" />
    } else {
        return <Outlet />
    }
}

export default PrivateRoutesAuth;