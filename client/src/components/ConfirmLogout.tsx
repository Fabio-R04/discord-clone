import React from "react";
import { useAppDispatch } from "../app/hooks";
import { logout } from "../features/auth/authSlice";

interface ConfirmLogoutProps {
    setConfirmLogout: (value: boolean) => void;
}

function ConfirmLogout({ setConfirmLogout }: ConfirmLogoutProps) {
    const dispatch = useAppDispatch();

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "confirm-logout") {
                setConfirmLogout(false);
            }
        }} className="confirm-logout" id="confirm-logout">
            <div className="confirm-logout__popup">
                <div className="confirm-logout__popup-info">
                    <p className="confirm-logout__popup-info__title">
                        Log Out
                    </p>
                    <p className="confirm-logout__popup-info__description">
                        Are you sure you want to logout?
                    </p>
                </div>
                <div className="confirm-logout__popup-buttons">
                    <button onClick={() => setConfirmLogout(false)} className="confirm-logout__popup-buttons__cancel">Cancel</button>
                    <button onClick={() => dispatch(logout())} className="confirm-logout__popup-buttons__logout">Log Out</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmLogout;