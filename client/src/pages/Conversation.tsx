import React, { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { getConversationDetails } from "../features/conversation/conversationSlice";
import {
    getAllFriends,
    getOnlineFriends,
    getPendingFriendRequests,
    removeFriend,
    sendFriendRequest,
    setAllFriends,
    setPendingFriendRequests
} from "../features/friend/friendSlice";
import { FriendRequest, FriendsList } from "../features/friend/friendInterfaces";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../contexts/SocketContext";
import { IUser } from "../features/auth/authInterface";
import { getMessages, handleMessageDelete } from "../features/message/messageSlice";
import { IMessage } from "../features/message/messageInterfaces";
import Layout from "../components/Layout";
import Spinner from "../components/Spinner";
import PlusIcon from "../components/svg/PlusIcon";
import PresentIcon from "../components/svg/PresentIcon";
import GifIcon from "../components/svg/GifIcon";
import StickerIcon from "../components/svg/StickerIcon";
import EmojiIcon from "../components/svg/EmojiIcon";
import moment from "moment";
import OnlineIcon from "../components/svg/OnlineIcon";
import OfflineIcon from "../components/svg/OfflineIcon";
import toast from "react-hot-toast";
import Message from "../components/Message";
import ConfirmDelete from "../components/ConfirmDelete";
const profileContext: any = require.context("../assets/default-profile-pictures", true);

export interface ConfirmDeleteData {
    message: IMessage | null;
    active: boolean;
}

function Conversation() {
    const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteData>({
        message: null,
        active: false
    });
    const [message, setMessage] = useState<string>("");
    const [userDetails, setUserDetails] = useState<IUser | null>(null);
    const {
        conversationDetails,
        loadingConversationDetails
    } = useAppSelector((state) => state.conversation);
    const {
        messages,
        loadingMessageAll
    } = useAppSelector((state) => state.message);
    const {
        activeUsers,
        allFriends,
        pendingFriendRequests,
        loadingFriendAll,
        loadingFriendRequests
    } = useAppSelector((state) => state.friend);
    const { user } = useAppSelector((state) => state.auth);
    const { conversationId } = useParams();
    const socket = useSocket();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(getPendingFriendRequests());
    }, []);

    useEffect(() => {
        if (!allFriends) {
            dispatch(getAllFriends());
        }
    }, [allFriends]);

    useEffect(() => {
        if (conversationDetails) {
            const targetUser: IUser | undefined = conversationDetails.users.find((u: IUser) => {
                if (u._id !== user?._id) {
                    return u;
                }
            });
            setUserDetails((targetUser === undefined ? null : targetUser));
        }
    }, [conversationDetails]);

    useEffect(() => {
        if (conversationId) {
            dispatch(getConversationDetails(conversationId));
            dispatch(getMessages(conversationId));
        }
    }, [conversationId]);

    useEffect(() => {
        if (socket) {
            socket.off("update-pending").on("update-pending", (pendingFriendRequests: FriendRequest[]): void => {
                dispatch(setPendingFriendRequests(pendingFriendRequests));
            });

            socket.off("update-friend-list").on("update-friend-list", (friendsList: FriendsList): void => {
                dispatch(setAllFriends(friendsList));
                dispatch(getOnlineFriends());
            });

            socket.off("delete-message-payload").on("delete-message-payload", (message: IMessage): void => {
                dispatch(handleMessageDelete(message));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (socket && conversationId) {
            joinRoom(conversationId);
        }
    }, [conversationId, socket]);

    const joinRoom = (conversationId: string): void => {
        socket?.emit("join-room", conversationId);
    }

    const sendMessage = (): void => {
        if (allFriends?.friendsList.find((friend: IUser) => friend._id === userDetails?._id)) {
            if (message.trim().length > 0) {
                socket?.emit("new-message", {
                    message,
                    conversationId,
                    userId: user?._id,
                    from: "conversation"
                });
            }
        } else {
            toast.error("Must be friends to send a direct message.");
        }
    }

    const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setMessage(event.target.value);
    }

    const handleMessageSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        sendMessage();
        setMessage("");
    }

    return (
        <Layout>
            <div className="conversation">
                {(loadingConversationDetails || loadingMessageAll || loadingFriendAll || loadingFriendRequests) ? (
                    <Spinner />
                ) : (
                    <>
                        <nav className="conversation__navbar">
                            <div className="conversation__navbar-user">
                                {(userDetails && !userDetails.hasProfilePicture.present) ? (
                                    <img
                                        src={profileContext(`./discord${userDetails.hasProfilePicture.color.toLowerCase()}.png`)}
                                        alt="Profile Picture"
                                    />
                                ) : (
                                    <img
                                        src={`${process.env.REACT_APP_SERVER_URL}/images/${userDetails?.hasProfilePicture.image}`}
                                        alt="Profile Picture"
                                    />
                                )}
                                <p>{userDetails?.displayName}</p>
                            </div>
                        </nav>
                        <hr className="layout__details-border" />
                        <div className="conversation__content">
                            <div className="conversation__content-messages">
                                <div className="conversation__content-messages__all">
                                    <div className="conversation__content-messages__all-heading">
                                        {userDetails && !userDetails.hasProfilePicture.present ? (
                                            <img
                                                src={profileContext(`./discord${userDetails.hasProfilePicture.color.toLowerCase()}.png`)}
                                                alt="Profile Picture"
                                                className="conversation__content-messages__all-img"
                                            />
                                        ) : (
                                            <img
                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${userDetails?.hasProfilePicture.image}`}
                                                alt="Profile Picture"
                                                className="conversation__content-messages__all-img"
                                            />
                                        )}
                                        <div className="conversation__content-messages__all-name">
                                            <h1 className="conversation__content-messages__all-display">{userDetails?.displayName}</h1>
                                            <p className="conversation__content-messages__all-username">{userDetails?.username}</p>
                                        </div>
                                        <p className="conversation__content-messages__all-beginning">
                                            This is the beginning of your direct message history with {userDetails?.displayName}.
                                        </p>
                                        <div className="conversation__content-messages__all-btns">
                                            {userDetails && pendingFriendRequests.find((friendRequest: FriendRequest) => {
                                                const sender: IUser = (friendRequest.sender as IUser);
                                                const receiver: IUser = (friendRequest.receiver as IUser);
                                                if ((userDetails._id === sender._id || userDetails._id === receiver._id) && (user?._id === sender._id || user?._id === receiver._id)) {
                                                    return friendRequest;
                                                }
                                            }) ? (
                                                <button onClick={() => {
                                                    navigate("/", { state: { pending: true } });
                                                }} className="conversation__content-messages__all-btns__request">
                                                    Pending Request
                                                </button>
                                            ) : (
                                                allFriends?.friendsList.find((friend: IUser) => friend._id === userDetails?._id) ? (
                                                    <button onClick={() => {
                                                        if (userDetails) {
                                                            dispatch(removeFriend(userDetails._id));
                                                        }
                                                    }} className="conversation__content-messages__all-btns__remove">
                                                        Remove Friend
                                                    </button>
                                                ) : (
                                                    <button onClick={() => {
                                                        if (userDetails) {
                                                            dispatch(sendFriendRequest(userDetails.username));
                                                        }
                                                    }} className="conversation__content-messages__all-btns__add">
                                                        Add Friend
                                                    </button>
                                                )
                                            )}
                                            <button style={{ cursor: "not-allowed" }}>Block</button>
                                        </div>
                                    </div>
                                    <div className="conversation__content-messages__all-content">
                                        {messages.map((message: IMessage, index: number) => {
                                            let sameDate: boolean = false;

                                            if (index > 0) {
                                                const currentDate: string = moment(message.createdAt).format("MM/DD/YYYY");
                                                const prevDate: string = moment(messages[index - 1].createdAt).format("MM/DD/YYYY");
                                                sameDate = (currentDate === prevDate) ? true : false;
                                            }

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
                                            )
                                        })}
                                    </div>
                                </div>
                                <form onSubmit={handleMessageSubmit} className="conversation__content-messages__form">
                                    <PlusIcon />
                                    <input
                                        type="text"
                                        placeholder={`Message @${userDetails?.displayName}`}
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
                            <div className="conversation__content-details">
                                <div style={{ backgroundColor: userDetails?.bannerColor }} className="conversation__content-details__banner"></div>
                                <div className="conversation__content-details__img">
                                    <div>
                                        {(userDetails && !userDetails?.hasProfilePicture.present) ? (
                                            <img
                                                src={profileContext(`./discord${userDetails?.hasProfilePicture.color.toLowerCase()}.png`)}
                                                alt="Profile Picture"
                                            />
                                        ) : (
                                            <img
                                                src={`${process.env.REACT_APP_SERVER_URL}/images/${userDetails?.hasProfilePicture.image}`}
                                                alt="Profile Picture"
                                            />
                                        )}
                                        <div className="conversation__content-details__img-status">
                                            {(activeUsers && userDetails && activeUsers[userDetails._id]) ? (
                                                <OnlineIcon />
                                            ) : (
                                                <OfflineIcon />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="conversation__content-details__content">
                                    <div className="conversation__content-details__content-top">
                                        <p>{userDetails?.displayName}</p>
                                        <p>{userDetails?.username}</p>
                                    </div>
                                    <hr />
                                    {userDetails?.aboutMe.trim() !== "" && (
                                        <div className="conversation__content-details__content-middle mb-sm">
                                            <p>ABOUT ME</p>
                                            <p>{userDetails?.aboutMe}</p>
                                        </div>
                                    )}
                                    <div className="conversation__content-details__content-middle">
                                        <p>DISCORD MEMBER SINCE</p>
                                        <p>{moment(userDetails?.createdAt).format("MMM DD, YYYY")}</p>
                                    </div>
                                    <hr />
                                    <div className="conversation__content-details__content-bottom">
                                        <p>NOTE</p>
                                        <input
                                            type="text"
                                            placeholder="Click to add a note"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {confirmDelete.active && (
                            <ConfirmDelete
                                message={confirmDelete.message!}
                                from="conversation"
                                setConfirmDelete={setConfirmDelete}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    )
}

export default Conversation;