import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { useNavigate } from "react-router-dom";
import { IMessage } from "../features/message/messageInterfaces";
import { ConfirmDeleteData } from "../pages/Conversation";
import { IServer } from "../features/server/serverInterfaces";
import moment from "moment";
import CloseIcon from "./svg/CloseIcon";
import HashtagIcon from "./svg/HashtagIcon";
import { joinServer, resetServer } from "../features/server/serverSlice";
import Spinner from "./Spinner";
const profileContext: any = require.context("../assets/default-profile-pictures", true);

interface MessageProps {
    message: IMessage;
    showDelete: boolean;
    setConfirmDelete?: (data: ConfirmDeleteData) => void;
}

export interface JoinServerData {
    serverId: string;
    memberId: string;
}

function Message({ message, showDelete, setConfirmDelete }: MessageProps) {
    const {
        loadingServerJoin,
        successServer,
        messageServer
    } = useAppSelector((state) => state.server);
    const { user } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (successServer && messageServer.includes("JOIN")) {
            navigate(`/server/${messageServer.split("-")[1]}`);
        }
        dispatch(resetServer());
    }, [successServer, messageServer, navigate, dispatch]);

    const handleServerJoin = (serverId: string, status: string): void => {
        if (status === "Join") {
            dispatch(joinServer({
                serverId,
                memberId: user?._id!
            }));
        } else if (status === "Joined") {
            navigate(`/server/${serverId}`);
        }
    }

    return (
        <div className="conversation__content-messages__all-content__message">
            {!message.user.hasProfilePicture.present ? (
                <img
                    src={profileContext(`./discord${message.user.hasProfilePicture.color.toLowerCase()}.png`)}
                    alt="Profile Picture"
                    className="conversation__content-messages__all-content__message-img"
                />
            ) : (
                <img
                    src={`${process.env.REACT_APP_SERVER_URL}/images/${message.user.hasProfilePicture.image}`}
                    alt="Profile Picture"
                    className="conversation__content-messages__all-content__message-img"
                />
            )}
            <div className="conversation__content-messages__all-content__message-details">
                <div className="conversation__content-messages__all-content__message-details__top">
                    <p>{message.user.displayName}</p>
                    {moment(message.createdAt).format("MM/DD/YYYY") === moment(new Date()).format("MM/DD/YYYY") ? (
                        <p>Today at {moment(message.createdAt).format("h:mm A")}</p>
                    ) : (
                        <>
                            <p>{moment(message.createdAt).format("MM/DD/YYYY")}</p>
                            <p>{moment(message.createdAt).format("h:mm A")}</p>
                        </>
                    )}
                </div>
                {message.type === "message" ? (
                    <p className="conversation__content-messages__all-content__message-details__bottom">
                        {message.message}
                    </p>
                ) : (
                    <div className="conversation__content-messages__all-content__message-details__invite">
                        <p className="conversation__content-messages__all-content__message-details__invite-heading">
                            {message.user._id === user?._id ? (
                                "YOU SENT AN INVITE TO JOIN A SERVER"
                            ) : (
                                "YOU HAVE BEEN INVITED TO JOIN A SERVER"
                            )}
                        </p>
                        <div className="conversation__content-messages__all-content__message-details__invite-container">
                            <div className="conversation__content-messages__all-content__message-details__invite-container__picture">
                                {!(message.serverInvite.server as IServer).serverPicture.present ? (
                                    <p>{(message.serverInvite.server as IServer).serverName.split(" ").length > 1 ? `${(message.serverInvite.server as IServer).serverName.split(" ")[0][0]}${(message.serverInvite.server as IServer).serverName.split(" ")[1][0]}` : (message.serverInvite.server as IServer).serverName.split(" ")[0][0]}</p>
                                ) : (
                                    <img
                                        src={`${process.env.REACT_APP_SERVER_URL}/images/${(message.serverInvite.server as IServer).serverPicture.image}`}
                                        alt="Server Picture"
                                    />
                                )}
                            </div>
                            <div className="conversation__content-messages__all-content__message-details__invite-container__details">
                                <p>{(message.serverInvite.server as IServer).serverName}</p>
                                <p>
                                    <HashtagIcon />
                                    general
                                </p>
                            </div>
                            <button style={message.user._id === user?._id ? { backgroundColor: "#5865f2" } : {}} onClick={() => {
                                if (!(message.user._id === user?._id)) {
                                    handleServerJoin((message.serverInvite.server as IServer)._id, message.serverInvite.status);
                                }
                            }} className={`conversation__content-messages__all-content__message-details__invite-container__btn ${message.serverInvite.status === "Joined" ? "btn-success" : "btn-primary"}`}>
                                {loadingServerJoin ? (
                                    <Spinner
                                        absolute={false}
                                        height="1.8rem"
                                        width="1.8rem"
                                    />
                                ) : (
                                    message.user._id === user?._id ? (
                                        "Invite Sent"
                                    ) : (
                                        message.serverInvite.status
                                    )
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {showDelete && (
                <div onClick={() => {
                    if (setConfirmDelete !== undefined) {
                        setConfirmDelete({
                            message,
                            active: true
                        });
                    }
                }} className="conversation__content-messages__all-content__message-delete">
                    <CloseIcon />
                </div>
            )}
        </div>
    )
}

export default Message