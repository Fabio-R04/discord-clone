import React, { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { setActiveUsers } from "../features/friend/friendSlice";
import { IConversation } from "../features/conversation/conversationInterfaces";
import { getConversations, resetConversation } from "../features/conversation/conversationSlice";
import { getServers, setChannelSelected } from "../features/server/serverSlice";
import { IServer, IServerMember, ITextChannel } from "../features/server/serverInterfaces";
import { useSocket } from "../contexts/SocketContext";
import { URL } from "../reusable";
import DiscordIcon from "./svg/DiscordIcon";
import FriendsIcon from "./svg/FriendsIcon";
import Spinner from "./Spinner";
import ConversationUser from "./ConversationUser";
import GearIcon from "./svg/GearIcon";
import SearchDMs from "./SearchDMs";
import NewServerIcon from "./svg/NewServerIcon";
import ExploreServerIcon from "./svg/ExploreServerIcon";
import NewServer from "./NewServer";
import ArrowheadDownIcon from "./svg/ArrowheadDownIcon";
import HashtagIcon from "./svg/HashtagIcon";
import UserProfile from "./UserProfile";
import NewChannel from "./NewChannel";
import CloseIcon from "./svg/CloseIcon";
import InvitePeopleIcon from "./svg/InvitePeopleIcon";
import InviteMembers from "./InviteMembers";
import EditChannel, { EditChannelData } from "./EditChannel";

interface LayoutProps {
    children: ReactNode;
}

function Layout({ children }: LayoutProps) {
    const [editChannel, setEditChannel] = useState<EditChannelData>({
        channel: null,
        active: false
    });
    const [inviteMembersActive, setInviteMembersActive] = useState<boolean>(false);
    const [serverPopupActive, setServerPopupActive] = useState<boolean>(false);
    const [newChannelActive, setNewChannelActive] = useState<boolean>(false);
    const [newServerActive, setNewServerActive] = useState<boolean>(false);
    const [searchDMsActive, setSearchDMsActive] = useState<boolean>(false);
    const {
        conversations,
        loadingConversationAll,
        successConversation,
        messageConversation
    } = useAppSelector((state) => state.conversation);
    const { pendingFriendRequests } = useAppSelector((state) => state.friend);
    const { servers } = useAppSelector((state) => state.server);
    const {
        serverDetails,
        channelSelected,
    } = useAppSelector((state) => state.server);
    const { user } = useAppSelector((state) => state.auth);
    const socket = useSocket();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (conversations.length === 0) {
            dispatch(getConversations());
        }

        if (servers.length === 0) {
            dispatch(getServers());
        }
    }, []);

    useEffect(() => {
        if (serverDetails) {
            if (channelSelected === null) {
                dispatch(setChannelSelected(serverDetails.textChannels[0]));
            }
        }
    }, [serverDetails]);

    useEffect(() => {
        if (socket) {
            socket.on("active-users", (activeUsers: Record<string, string>): void => {
                dispatch(setActiveUsers(activeUsers));
            });
        }
    }, [socket]);

    useEffect(() => {
        if (successConversation && messageConversation.includes("INVITE")) {
            console.log(messageConversation);
            navigate(`/conversation/${messageConversation.split("-")[1]}`);
        }
        dispatch(resetConversation());
    }, [successConversation, messageConversation, navigate, dispatch]);

    return (
        <>
            <div className="layout">
                <div className="layout__servers">
                    <div className={`layout__servers-server ${(location.pathname === "/" || location.pathname.includes("/conversation")) ? "layout__servers-server__active" : ""}`}>
                        <Link to="/" className="layout__servers-home" title="Direct Messages">
                            <DiscordIcon />
                        </Link>
                    </div>
                    <div className="layout__servers-divider"></div>
                    <div className="layout__servers-bottom">
                        {servers.map((s: IServerMember) => {
                            const server: IServer = (s.server as IServer);
                            return (
                                <div key={server._id} className={`layout__servers-server ${location.pathname === `/server/${server._id}` ? "layout__servers-server__active" : ""}`}>
                                    <Link to={`/server/${server._id}`} className="layout__servers-regular" title={server.serverName}>
                                        {server.serverPicture.present ? (
                                            <img
                                                src={`${URL}/images/${server.serverPicture.image}`}
                                                alt="Server Picture"
                                            />
                                        ) : (
                                            <p>{server.serverName.split(" ").length > 1 ? `${server.serverName.split(" ")[0][0]}${server.serverName.split(" ")[1][0]}` : server.serverName.split(" ")[0][0]}</p>
                                        )}
                                    </Link>
                                </div>
                            )
                        })}
                        <div className="layout__servers-server">
                            <Link onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                event.preventDefault();
                                setNewServerActive(true);
                            }} to="/#" className="layout__servers-interact" title="Add a Server">
                                <NewServerIcon />
                            </Link>
                        </div>
                        <div className="layout__servers-server">
                            <Link onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
                                event.preventDefault();
                            }} to="/#" className="layout__servers-interact layout__servers-interact__explore" title="Explore Discoverable Servers">
                                <ExploreServerIcon />
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="layout__details">
                    {(location.pathname === "/" || location.pathname.includes("/conversation")) && (
                        <div className="layout__details-home">
                            <div className="layout__details-home__search">
                                <div onClick={() => setSearchDMsActive(true)}>
                                    <p>Find or start a conversation</p>
                                </div>
                            </div>
                            <hr className="layout__details-border" />
                            <div className="layout__details-home__interaction">
                                <div onClick={() => navigate("/")} className={`layout__details-home__interaction-friends ${location.pathname === "/" ? "layout__details-home__interaction-active" : ""}`}>
                                    <FriendsIcon />
                                    <p>Friends</p>
                                    {pendingFriendRequests.length > 0 && (
                                        <div style={{ marginLeft: "auto" }} className="home__navigation-pending__length">
                                            <p>{pendingFriendRequests.length}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="layout__details-home__messages">
                                <p className="layout__details-home__messages-heading">DIRECT MESSAGES</p>
                                <div className="layout__details-home__messages-content">
                                    {loadingConversationAll ? (
                                        <Spinner />
                                    ) : (
                                        conversations.map((conversation: IConversation) => {
                                            if (conversation.visible.find((v) => {
                                                if (v.userId === user?._id && v.isVisible) {
                                                    return v;
                                                }
                                            })) {
                                                return (
                                                    <ConversationUser
                                                        key={conversation._id}
                                                        conversationId={conversation._id}
                                                        userDetails={conversation.users.find((u) => u._id !== user?._id)!}
                                                    />
                                                )
                                            }
                                        })
                                    )}
                                </div>
                            </div>
                            <UserProfile />
                        </div>
                    )}
                    {location.pathname.includes("/server") && (
                        <div className="layout__details-server">
                            <div onClick={() => setServerPopupActive(!serverPopupActive)} className="layout__details-server__heading-dropdown">
                                <div style={serverPopupActive ? { backgroundColor: "rgb(60, 60, 68)" } : {}} className="layout__details-server__heading" id="layout__dropdown-container">
                                    <p>{serverDetails?.serverName}</p>
                                    {serverPopupActive ? (
                                        <CloseIcon
                                            style={{ height: "1.5rem", width: "1.5rem" }}
                                        />
                                    ) : (
                                        <ArrowheadDownIcon />
                                    )}
                                    <div className={`layout__details-server__heading-dropdown__menu ${serverPopupActive ? "layout__details-server__heading-dropdown__menu-active" : ""}`}>
                                        <div onClick={() => {
                                            setServerPopupActive(false);
                                            setInviteMembersActive(true);
                                        }} className="layout__details-server__heading-dropdown__menu-option">
                                            <p>Invite People</p>
                                            <InvitePeopleIcon />
                                        </div>
                                        {user?._id === serverDetails?.serverOwner._id && (
                                            <div onClick={() => navigate(`/server/${serverDetails?._id}/settings`)} className="layout__details-server__heading-dropdown__menu-option">
                                                <p>Server Settings</p>
                                                <GearIcon />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <hr className="layout__details-border" />
                            <div className="layout__details-server__channels">
                                <div className="layout__details-server__channels-heading">
                                    <p>TEXT CHANNELS</p>
                                    {serverDetails?.serverOwner?._id === user?._id && (
                                        <div onClick={() => setNewChannelActive(true)} title="Create Channel">
                                            <NewServerIcon />
                                        </div>
                                    )}
                                </div>
                                <div className="layout__details-server__channels-all">
                                    {serverDetails?.textChannels.map((channel: ITextChannel, index: number) => (
                                        <div onClick={() => dispatch(setChannelSelected(channel))} key={index} className={`layout__details-server__channels-all__channel ${channelSelected?._id === channel._id ? "layout__details-server__channels-all__channel-active" : ""}`}>
                                            <div title="Text">
                                                <HashtagIcon />
                                            </div>
                                            <p>{channel.name}</p>
                                            {serverDetails?.serverOwner?._id === user?._id && (
                                                <div onClick={() => setEditChannel({
                                                    channel: channel,
                                                    active: true
                                                })} title="Edit Channel">
                                                    <GearIcon />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <UserProfile />
                        </div>
                    )}
                </div>
                <main className="layout__content">
                    {children}
                </main>
            </div>
            {searchDMsActive && (
                <SearchDMs
                    setSearchDMsActive={setSearchDMsActive}
                />
            )}
            {newServerActive && (
                <NewServer
                    setNewServerActive={setNewServerActive}
                />
            )}
            {newChannelActive && (
                <NewChannel
                    serverId={serverDetails?._id!}
                    setNewChannelActive={setNewChannelActive}
                />
            )}
            {inviteMembersActive && (
                <InviteMembers
                    serverId={serverDetails?._id!}
                    serverName={serverDetails?.serverName!}
                    setInviteMembersActive={setInviteMembersActive}
                />
            )}
            {editChannel.active && (
                <EditChannel
                    channel={editChannel.channel!}
                    setEditChannel={setEditChannel}
                />
            )}
        </>
    )
}

export default Layout;