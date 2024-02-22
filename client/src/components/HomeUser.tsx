import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { createConversation, resetConversation } from "../features/conversation/conversationSlice";
import { removeFriend } from "../features/friend/friendSlice";
import { IUser } from "../features/auth/authInterface";
import MessageBoxIcon from "./svg/MessageBoxIcon";
import OptionsIcon from "./svg/OptionsIcon";
import CloseIcon from "./svg/CloseIcon";
import Spinner from "./Spinner";
import OnlineIcon from "./svg/OnlineIcon";
import OfflineIcon from "./svg/OfflineIcon";
const profileContext: any = require.context("../assets/default-profile-pictures", true);

interface HomeUserProps {
    userDetails: IUser;
}

function HomeUser({ userDetails }: HomeUserProps) {
    const {
        activeUsers,
        loadingFriendRemove
    } = useAppSelector((state) => state.friend);
    const {
        activeConversation,
        loadingConversationCreate,
        successConversation,
        messageConversation
    } = useAppSelector((state) => state.conversation);

    const dispatch = useAppDispatch();
    const navigate = useNavigate()

    useEffect(() => {
        if (successConversation && messageConversation === "CONVERSATION CREATED") {
            navigate(`/conversation/${activeConversation?._id}`);
        }
        dispatch(resetConversation());
    }, [successConversation, messageConversation, dispatch]);

    return (
        <div className="home__content-pending__requests-all__container">
            <hr className="home__content-pending__requests-all__border" />
            <div className="home__content-pending__requests-all__request">
                <div className="home__content-pending__requests-all__request-img__container">
                    {!userDetails.hasProfilePicture.present ? (
                        <img
                            src={profileContext(`./discord${userDetails.hasProfilePicture.color.toLowerCase()}.png`)}
                            alt="Profile Picture"
                            className="home__content-pending__requests-all__request-img"
                        />
                    ) : (
                        <img
                            src={`${process.env.REACT_APP_SERVER_URL}/images/${userDetails.hasProfilePicture.image}`}
                            alt="Profile Picture"
                            className="home__content-pending__requests-all__request-img"
                        />
                    )}
                    <div className="home__content-pending__requests-all__request-img__container-status">
                        {(activeUsers && activeUsers[userDetails._id]) ? (
                            <OnlineIcon
                                key="online-icon"
                            />
                        ) : (
                            <OfflineIcon
                                key="offline-icon"
                                height="85%"
                                width="85%"
                            />
                        )}
                    </div>
                </div>
                <div className="home__content-pending__requests-all__request-details">
                    <p>{userDetails.displayName}</p>
                    <p>{(activeUsers && activeUsers[userDetails._id]) ? "Online" : "Offline"}</p>
                </div>
                <div className="home__content-pending__requests-all__request-interact">
                    <div onClick={() => dispatch(createConversation(userDetails._id))} className="home__content-pending__requests-all__request-interact__icon" id="message" title="Message">
                        {loadingConversationCreate ? (
                            <Spinner
                                absolute={false}
                                height="2rem"
                                width="2rem"
                            />
                        ) : (
                            <MessageBoxIcon />
                        )}
                    </div>
                    <div onClick={() => dispatch(removeFriend(userDetails._id))} className="home__content-pending__requests-all__request-interact__icon" id="reject" title="Remove">
                        {loadingFriendRemove ? (
                            <Spinner
                                absolute={false}
                                height="2rem"
                                width="2rem"
                            />
                        ) : (
                            <CloseIcon />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeUser;