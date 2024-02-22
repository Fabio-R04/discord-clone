import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";
import OnlineIcon from "./svg/OnlineIcon";
import OfflineIcon from "./svg/OfflineIcon";
import MuteIcon from "./svg/MuteIcon";
import DefeanIcon from "./svg/DefeanIcon";
import GearIcon from "./svg/GearIcon";
const profileContext = require.context("../assets/default-profile-pictures", true);

function UserProfile() {
    const { activeUsers } = useAppSelector((state) => state.friend);
    const { user } = useAppSelector((state) => state.auth);

    const navigate = useNavigate();

    return (
        <div className="layout__details-home__profile">
            <div className="layout__details-home__profile-user">
                <div className="layout__details-home__profile-user__img">
                    {!user?.hasProfilePicture.present ? (
                        <img
                            src={profileContext(`./discord${user?.hasProfilePicture.color.toLowerCase()}.png`)}
                            alt="Profile Picture"
                        />
                    ) : (
                        <img
                            src={`${process.env.REACT_APP_SERVER_URL}/images/${user?.hasProfilePicture.image}`}
                            alt="Profile Picture"
                        />
                    )}
                    <div>
                        {activeUsers && activeUsers[user?._id!] ? (
                            <OnlineIcon />
                        ) : (
                            <OfflineIcon />
                        )}
                    </div>
                </div>
                <div className="layout__details-home__profile-user__details">
                    <p>{user?.displayName}</p>
                    <p>{user?.username}</p>
                </div>
            </div>
            <div className="layout__details-home__profile-interaction">
                <MuteIcon />
                <DefeanIcon />
                <div onClick={() => navigate("/profile")}>
                    <GearIcon />
                </div>
            </div>
        </div>
    )
}

export default UserProfile;