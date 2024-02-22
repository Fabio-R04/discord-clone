import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import {
    getPendingFriendRequests,
    sendFriendRequest,
    setPendingFriendRequests,
    searchPendingFriendRequests,
    getAllFriends,
    getOnlineFriends,
    searchOnlineFriends,
    setAllFriends,
    resetFriend,
    searchAllFriends
} from "../features/friend/friendSlice";
import { setConversations } from "../features/conversation/conversationSlice";
import { FriendRequest, FriendsList } from "../features/friend/friendInterfaces";
import { useSocket } from "../contexts/SocketContext";
import { IUser } from "../features/auth/authInterface";
import { IConversation } from "../features/conversation/conversationInterfaces";
import Layout from "../components/Layout";
import FriendsIcon from "../components/svg/FriendsIcon";
import ExploreIcon from "../components/svg/ExploreIcon";
import ArrowheadRightIcon from "../components/svg/ArrowheadRightIcon";
import Wumpus from "../components/svg/Wumpus";
import Spinner from "../components/Spinner";
import SearchIcon from "../components/svg/SearchIcon";
import HomeUserRequest from "../components/HomeUserRequest";
import HomeUser from "../components/HomeUser";
import WumpusPending from "../components/svg/WumpusPending";
import WumpusFriends from "../components/svg/WumpusFriends";
import WumpusOnline from "../components/svg/WumpusOnline";

export interface FriendsNavigationStatus {
    onlineActive: boolean;
    allActive: boolean;
    pendingActive: boolean;
    addFriendActive: boolean;
}

function Home() {
    const [friendsStatus, setFriendsStatus] = useState<FriendsNavigationStatus>({
        onlineActive: true,
        allActive: false,
        pendingActive: false,
        addFriendActive: false
    });
    const [targetUsername, setTargetUsername] = useState<string>("");
    const {
        onlineFriends,
        allFriends,
        pendingFriendRequests,
        filteredOnlineFriends,
        filteredAllFriends,
        filteredFriendRequests,
        successFriend,
        messageFriend,
        loadingFriendAll,
        loadingFriendRequest,
        loadingFriendRequests,
    } = useAppSelector((state) => state.friend);
    const { user } = useAppSelector((state) => state.auth);

    const socket = useSocket();
    const dispatch = useAppDispatch();
    const location = useLocation();

    useEffect(() => {
        dispatch(getAllFriends());
        dispatch(getOnlineFriends());
        dispatch(getPendingFriendRequests());
    }, []);

    useEffect(() => {
        if (location.state?.pending) {
            handleFriendsStatusChange("pendingActive");
        }
    }, [(location.state && location.state.pending)]);

    useEffect(() => {
        if (socket) {
            socket.on("active-users", (activeUsers: Record<string, string>): void => {
                dispatch(getOnlineFriends());
            });

            socket.off("update-pending").on("update-pending", (pendingFriendRequests: FriendRequest[]): void => {
                dispatch(setPendingFriendRequests(pendingFriendRequests));
            });

            socket.off("update-friend-list").on("update-friend-list", (friendsList: FriendsList): void => {
                dispatch(setAllFriends(friendsList));
                dispatch(getOnlineFriends());
            });

            socket.off("update-conversations").on("update-conversations", (conversations: IConversation[]): void => {
                dispatch(setConversations(conversations));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (successFriend && (messageFriend === "FRIEND REMOVED" || messageFriend === "FRIEND REQUEST ACCEPTED")) {
            dispatch(getOnlineFriends());
        }

        dispatch(resetFriend());
    }, [successFriend, messageFriend, dispatch]);

    const resetFriendsStatus = (): void => {
        setFriendsStatus({
            onlineActive: false,
            allActive: false,
            pendingActive: false,
            addFriendActive: false
        });
    }

    const handleFriendsStatusChange = (key: string): void => {
        resetFriendsStatus();
        setFriendsStatus((prevState) => {
            return {
                ...prevState,
                [key]: true
            }
        });
    }

    const handleTargetUserChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTargetUsername(event.target.value);
    }

    const handleFriendRequestSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        dispatch(sendFriendRequest(targetUsername));
        setTargetUsername("");
    }

    const handleFriendRequestSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(searchPendingFriendRequests({
            query: event.target.value,
            userId: user?._id!
        }));
    }

    const handleOnlineFriendsSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(searchOnlineFriends(event.target.value));
    }

    const handleAllFriendsSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(searchAllFriends(event.target.value));
    }

    return (
        <Layout>
            <div className="home">
                <nav className="home__navigation">
                    <div className="home__navigation-title">
                        <FriendsIcon />
                        <p>Friends</p>
                    </div>
                    <div className="divider home__navigation-item"></div>
                    <div onClick={() => handleFriendsStatusChange("onlineActive")} className={`home__navigation-item ${friendsStatus.onlineActive ? "home__navigation-item__active" : ""}`}>
                        <p>Online</p>
                    </div>
                    <div onClick={() => handleFriendsStatusChange("allActive")} className={`home__navigation-item ${friendsStatus.allActive ? "home__navigation-item__active" : ""}`}>
                        <p>All</p>
                    </div>
                    <div onClick={() => handleFriendsStatusChange("pendingActive")} className={`home__navigation-item home__navigation-pending ${friendsStatus.pendingActive ? "home__navigation-item__active" : ""}`}>
                        <p>Pending</p>
                        {pendingFriendRequests.length > 0 && (
                            <div className="home__navigation-pending__length">
                                <p>{pendingFriendRequests.length}</p>
                            </div>
                        )}
                    </div>
                    <div style={{ cursor: "not-allowed" }} className="home__navigation-item">
                        <p>Blocked</p>
                    </div>
                    <div onClick={() => handleFriendsStatusChange("addFriendActive")} className={`home__navigation-add home__navigation-item ${friendsStatus.addFriendActive ? "home__navigation-add__active" : ""}`}>
                        <p>Add Friend</p>
                    </div>
                </nav>
                <hr className="layout__details-border" />
                <div className="home__content">
                    {friendsStatus.onlineActive && (
                        onlineFriends.length > 0 ? (
                            <div className="home__content-friends">
                                <div className="home__content-pending__search">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        onChange={handleOnlineFriendsSearch}
                                    />
                                    <SearchIcon />
                                </div>
                                <div className="home__content-friends__users">
                                    <div className="home__content-pending__requests-heading">
                                        <p>ONLINE &mdash; {filteredOnlineFriends.length}</p>
                                    </div>
                                    <div className="home__content-friends__users-all">
                                        {filteredOnlineFriends.map((u) => (
                                            <HomeUser
                                                key={u._id}
                                                userDetails={u}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="home__content-add__bottom-wumpus">
                                <WumpusOnline />
                                <p>No one's around to play with Wumpus.</p>
                            </div>
                        )
                    )}
                    {friendsStatus.allActive && (
                        loadingFriendAll ? (
                            <Spinner />
                        ) : (
                            (allFriends && allFriends.friendsList.length > 0) ? (
                                <div className="home__content-friends">
                                    <div className="home__content-pending__search">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            onChange={handleAllFriendsSearch}
                                        />
                                        <SearchIcon />
                                    </div>
                                    <div className="home__content-friends__users">
                                        <div className="home__content-pending__requests-heading">
                                            <p>ALL FRIENDS &mdash; {filteredAllFriends.length}</p>
                                        </div>
                                        <div className="home__content-friends__users-all">
                                            {filteredAllFriends.map((u) => (
                                                <HomeUser
                                                    key={u._id}
                                                    userDetails={u}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="home__content-add__bottom-wumpus">
                                    <WumpusFriends />
                                    <p>No friends, only Wumpus.</p>
                                </div>
                            )
                        )
                    )}
                    {friendsStatus.pendingActive && (
                        loadingFriendRequests ? (
                            <Spinner />
                        ) : (
                            pendingFriendRequests.length > 0 ? (
                                <div className="home__content-pending">
                                    <div className="home__content-pending__search">
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            onChange={handleFriendRequestSearch}
                                        />
                                        <SearchIcon />
                                    </div>
                                    <div className="home__content-pending__requests">
                                        <div className="home__content-pending__requests-heading">
                                            <p>PENDING &mdash; {filteredFriendRequests.length}</p>
                                            <p>Clear Incoming</p>
                                        </div>
                                        <div className="home__content-pending__requests-all">
                                            {filteredFriendRequests.map((r) => {
                                                const receiver: IUser = (r.receiver as IUser);
                                                const sender: IUser = (r.sender as IUser);
                                                let u: IUser;
                                                if (sender._id === user?._id) {
                                                    u = receiver;
                                                } else {
                                                    u = sender;
                                                }
                                                return (
                                                    <HomeUserRequest
                                                        key={r._id}
                                                        r={r}
                                                        receiver={receiver}
                                                        sender={sender}
                                                        u={u}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="home__content-add__bottom-wumpus">
                                    <WumpusPending />
                                    <p>There are no pending friend requests. Here's Wumpus for now.</p>
                                </div>
                            )
                        )
                    )}
                    {friendsStatus.addFriendActive && (
                        loadingFriendRequest ? (
                            <Spinner />
                        ) : (
                            <div className="home__content-add">
                                <div className="home__content-add__top">
                                    <p className="home__content-add__title">ADD FRIEND</p>
                                    <p className="home__content-add__description">
                                        You can add friends with their Discord username.
                                    </p>
                                    <form onSubmit={handleFriendRequestSubmit} className="home__content-add__top-form">
                                        <input
                                            required
                                            type="text"
                                            placeholder="You can add friends with their Discord username."
                                            value={targetUsername}
                                            onChange={handleTargetUserChange}
                                        />
                                        <button disabled={targetUsername.trim() === "" ? true : false} type="submit">Send Friend Request</button>
                                    </form>
                                </div>
                                <div className="home__content-add__bottom">
                                    <p className="home__content-add__title">
                                        OTHER PLACES TO MAKE FRIENDS
                                    </p>
                                    <div className="home__content-add__bottom-explore">
                                        <div>
                                            <ExploreIcon />
                                        </div>
                                        <p>Explore Discoverable Servers</p>
                                        <ArrowheadRightIcon />
                                    </div>
                                    <div className="home__content-add__bottom-wumpus">
                                        <Wumpus />
                                        <p>Wumpus is waiting on friends. You don't have to though!</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default Home;