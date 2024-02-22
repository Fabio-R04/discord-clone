import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { appendServerMessage, getServerDetails, getServerMembers, getServerMessages, handleDeleteServerMessage } from "../features/server/serverSlice";
import { IServerMember } from "../features/server/serverInterfaces";
import { IUser } from "../features/auth/authInterface";
import { URL, getConfig } from "../reusable";
import axios from "axios";
import Layout from "../components/Layout";
import HashtagIcon from "../components/svg/HashtagIcon";
import LoadingScreen from "../components/LoadingScreen";
import Members from "../components/svg/Members";
import SearchIcon from "../components/svg/SearchIcon";
import OnlineIcon from "../components/svg/OnlineIcon";
import OfflineIcon from "../components/svg/OfflineIcon";
import ServerOwnerIcon from "../components/svg/ServerOwnerIcon";
import EmojiIcon from "../components/svg/EmojiIcon";
import GifIcon from "../components/svg/GifIcon";
import PlusIcon from "../components/svg/PlusIcon";
import PresentIcon from "../components/svg/PresentIcon";
import StickerIcon from "../components/svg/StickerIcon";
import { useSocket } from "../contexts/SocketContext";
import { IMessage } from "../features/message/messageInterfaces";
import Message from "../components/Message";
import moment from "moment";
import { ConfirmDeleteData } from "./Conversation";
import ConfirmDelete from "../components/ConfirmDelete";
const profileContext = require.context("../assets/default-profile-pictures", true);

function Server() {
    const [message, setMessage] = useState<string>("");
    const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteData>({
        message: null,
        active: false
    });
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [offlineCount, setOfflineCount] = useState<number>(0);
    const [hideMemberList, setHideMemberList] = useState<boolean>(false);
    const { serverId } = useParams();
    const {
        channelSelected,
        serverDetails,
        serverMembers,
        serverMessages,
        loadingServerDetails,
        loadingServerMembers,
        loadingServerMessages
    } = useAppSelector((state) => state.server);
    const { activeUsers } = useAppSelector((state) => state.friend);
    const { user } = useAppSelector((state) => state.auth);
    const socket = useSocket();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (serverId) {
            (async () => {
                try {
                    const response = await axios.get(
                        `${URL}/server/check-member/${serverId}`,
                        getConfig(user?.token!)
                    );
                    const isMember: boolean = response.data;

                    if (!isMember) {
                        navigate("/");
                    }
                } catch (error) {
                    navigate("/");
                }
            })();

            dispatch(getServerDetails(serverId));
            dispatch(getServerMembers(serverId));
            dispatch(getServerMessages(serverId));
        }
    }, [serverId]);

    useEffect(() => {
        if (socket) {
            socket.off("receive-server-message").on("receive-server-message", (message: IMessage): void => {
                dispatch(appendServerMessage(message));
            });

            socket.off("delete-server-message-payload").on("delete-server-message-payload", (message: IMessage): void => {
                dispatch(handleDeleteServerMessage(message));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (socket && serverId) {
            joinServerRoom(serverId);
        }
    }, [socket, serverId]);

    useEffect(() => {
        setOnlineCount(document.querySelectorAll(".server__content-members__online-user").length);
        setOfflineCount(document.querySelectorAll(".server__content-members__offline-user").length);
    }, [document.querySelectorAll(".server__content-members__online-user"), document.querySelectorAll(".server__content-members__offline-user")]);

    const joinServerRoom = (conversationId: string): void => {
        socket?.emit("join-room", conversationId);
    }

    const sendServerMessage = (): void => {
        if (message.trim() !== "") {
            socket?.emit("new-message", {
                message,
                conversationId: serverId,
                userId: user?._id,
                from: "server",
                textChannel: channelSelected
            });
        }
    }

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMessage(event.target.value);
    }

    const handleMessageSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        sendServerMessage();
        setMessage("");
    }

    return (
        <Layout>
            <>
                {(loadingServerDetails || loadingServerMembers || loadingServerMessages) ? (
                    <LoadingScreen />
                ) : (
                    <div className="server">
                        <div className="server__heading">
                            <div className="server__heading-left">
                                <HashtagIcon />
                                <p>{channelSelected?.name}</p>
                            </div>
                            <div className="server__heading-right">
                                <div onClick={() => setHideMemberList(!hideMemberList)} className={`server__heading-right__toggle ${!hideMemberList ? "server__heading-right__toggle-active" : ""}`} title={hideMemberList ? "Show Member List" : "Hide Member List"}>
                                    <Members />
                                </div>
                                <div className="server__heading-right__search">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        disabled
                                    />
                                    <SearchIcon />
                                </div>
                            </div>
                        </div>
                        <hr className="layout__details-border" />
                        <div className={`server__content ${hideMemberList ? "server__content-full" : ""}`}>
                            <div className="server__content-messages">
                                <div className="server__content-messages__container">
                                    <div className="server__content-messages__heading">
                                        <h1>
                                            Welcome to<br />{serverDetails?.serverName}
                                        </h1>
                                        <p>
                                            This is the beginning of this server.
                                        </p>
                                    </div>
                                    <div className="server__content-messages__all">
                                        {serverMessages.map((message: IMessage, index: number) => {
                                            let sameDate: boolean = false;

                                            if (index > 0) {
                                                const currentDate: string = moment(message.createdAt).format("MM/DD/YYYY");
                                                const prevDate: string = moment(serverMessages[index - 1].createdAt).format("MM/DD/YYYY");
                                                sameDate = (currentDate === prevDate) ? true : false;
                                            }

                                            if (message?.textChannel?.name === channelSelected?.name) {
                                                return (
                                                    <div className="conversation__content-messages__all-content__container" key={message._id}>
                                                        {!sameDate && (
                                                            <p className="conversation__content-messages__all-content__container-date">{moment(message.createdAt).format("MMMM DD, YYYY")}</p>
                                                        )}
                                                        <Message
                                                            key={message.user._id}
                                                            message={message}
                                                            showDelete={message.user._id === user?._id ? true : false}
                                                            setConfirmDelete={setConfirmDelete}
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                                <form onSubmit={handleMessageSubmit} className="conversation__content-messages__form server__content-messages__create">
                                    <PlusIcon />
                                    <input
                                        type="text"
                                        placeholder={`Message #${channelSelected?.name}`}
                                        onChange={handleMessageChange}
                                        value={message}
                                        className="conversation__content-messages__form-send"
                                    />
                                    <div className="conversation__content-messages__form-interaction">
                                        <PresentIcon />
                                        <GifIcon />
                                        <StickerIcon />
                                        <EmojiIcon />
                                    </div>
                                </form>
                            </div>
                            <div className={`server__content-members ${hideMemberList ? "server__content-members__hidden" : ""}`}>
                                <div className="server__content-members__online">
                                    {onlineCount > 0 && (
                                        <p className="server__content-members__online-heading">
                                            ONLINE &mdash; {onlineCount}
                                        </p>
                                    )}
                                    {activeUsers && serverMembers.map((member: IServerMember) => {
                                        if (activeUsers[(member.user as IUser)._id]) {
                                            const m: IUser = (member.user as IUser);

                                            return (
                                                <div key={member._id} className="server__content-members__online-user">
                                                    <div className="server__content-members__online-user__img">
                                                        {!m.hasProfilePicture.present ? (
                                                            <img
                                                                src={profileContext(`./discord${m.hasProfilePicture.color.toLowerCase()}.png`)}
                                                                alt="Profile Picture"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${m.hasProfilePicture.image}`}
                                                                alt="Profile Picture"
                                                            />
                                                        )}
                                                        <div>
                                                            <OnlineIcon />
                                                        </div>
                                                    </div>
                                                    <p>{m.displayName}</p>
                                                    {serverDetails?.serverOwner?._id === m._id && (
                                                        <div>
                                                            <ServerOwnerIcon />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                                <div className="server__content-members__offline">
                                    {offlineCount > 0 && (
                                        <p className="server__content-members__offline-heading">
                                            OFFLINE &mdash; {offlineCount}
                                        </p>
                                    )}
                                    {activeUsers && serverMembers.map((member: IServerMember) => {
                                        if (!activeUsers.hasOwnProperty((member.user as IUser)._id)) {
                                            const m: IUser = (member.user as IUser);

                                            return (
                                                <div key={member._id} className="server__content-members__offline-user">
                                                    <div className="server__content-members__offline-user__img">
                                                        {!m.hasProfilePicture.present ? (
                                                            <img
                                                                src={profileContext(`./discord${m.hasProfilePicture.color.toLowerCase()}.png`)}
                                                                alt="Profile Picture"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${m.hasProfilePicture.image}`}
                                                                alt="Profile Picture"
                                                            />
                                                        )}
                                                        <div>
                                                            <OfflineIcon />
                                                        </div>
                                                    </div>
                                                    <p>{m.displayName}</p>
                                                    {serverDetails?.serverOwner?._id === m._id && (
                                                        <div title="Server Owner">
                                                            <ServerOwnerIcon />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </>
            {confirmDelete.active && (
                <ConfirmDelete
                    message={confirmDelete.message!}
                    setConfirmDelete={setConfirmDelete}
                    from="server"
                />
            )}
        </Layout>
    )
}

export default Server;