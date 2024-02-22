import React, { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { IUser } from "../features/auth/authInterface";
import CloseIcon from "./svg/CloseIcon";
import OnlineIcon from "./svg/OnlineIcon";
import OfflineIcon from "./svg/OfflineIcon";
import { hideConversation } from "../features/conversation/conversationSlice";
const profileContext: any = require.context("../assets/default-profile-pictures", true);

interface ConversationUserProps {
    conversationId: string;
    userDetails: IUser;
}

function ConversationUser({ userDetails, conversationId }: ConversationUserProps) {
    const { activeUsers } = useAppSelector((state) => state.friend);
    const convId = useParams().conversationId;

    const dispatch = useAppDispatch();
    const navigate = useNavigate()
    const location = useLocation();

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target: HTMLDivElement = event.target as HTMLDivElement;
            if (target.id !== "conversation-close") {
                navigate(`/conversation/${conversationId}`);
            }
        }} className={
            `home__content-pending__requests-all__request layout__details-home__messages-content__message ${(location.pathname === `/conversation/${convId}` && conversationId === convId) ? "layout__details-home__messages-content__message-active" : ""}`
        }>
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
                <div className="home__content-pending__requests-all__request-img__container-status layout__details-home__messages-content__message-status">
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
            <div className="home__content-pending__requests-all__request-details__conversation">
                <p>{userDetails.displayName}</p>
            </div>
            <div id="conversation-close" onClick={() => dispatch(hideConversation(conversationId))} className="home__content-pending__requests-all__request-interact layout__details-home__messages-content__message-close">
                <CloseIcon />
            </div>
        </div>
    )
}

export default ConversationUser;