import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { getAllFriends, searchAllFriends } from "../features/friend/friendSlice";
import { inviteMember } from "../features/server/serverSlice";
import HashtagIcon from "./svg/HashtagIcon";
import CloseIcon from "./svg/CloseIcon";
import SearchIcon from "./svg/SearchIcon";
import Spinner from "./Spinner";
const profileContext = require.context("../assets/default-profile-pictures");

interface InviteMembersProps {
    serverId: string;
    serverName: string;
    setInviteMembersActive: (value: boolean) => void;
}

export interface InviteMemberData {
    serverId: string;
    targetUserId: string;
}

function InviteMembers({ serverId, serverName, setInviteMembersActive }: InviteMembersProps) {
    const {
        filteredAllFriends,
        allFriends,
        loadingFriendAll
    } = useAppSelector((state) => state.friend);
    const { loadingServerInviteMember } = useAppSelector((state) => state.server);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!allFriends) {
            dispatch(getAllFriends());
        }
    }, []);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(searchAllFriends(event.target.value));
    }

    const handleInviteClick = (targetUserId: string): void => {
        dispatch(inviteMember({
            serverId,
            targetUserId
        }));
    }

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "invite-members") {
                setInviteMembersActive(false);
            }
        }} className="invite-members" id="invite-members">
            <div className="invite-members__popup">
                <div className="invite-members__popup-heading">
                    <div className="invite-members__popup-heading__top">
                        <div className="invite-members__popup-heading__top-text">
                            <p>Invite friends to {serverName}</p>
                            <p>
                                <HashtagIcon />
                                general
                            </p>
                        </div>
                        <div onClick={() => setInviteMembersActive(false)} className="invite-members__popup-heading__top-close">
                            <CloseIcon />
                        </div>
                    </div>
                    <div className="invite-members__popup-heading__bottom">
                        <input
                            onChange={handleSearch}
                            type="text"
                            placeholder="Search for friends"
                        />
                        <SearchIcon />
                    </div>
                </div>
                <div className="invite-members__popup-friends">
                    {loadingFriendAll ? (
                        <Spinner />
                    ) : (
                        allFriends && filteredAllFriends.map((friend) => (
                            <div key={friend._id} className="invite-members__popup-friends__friend">
                                {!friend.hasProfilePicture.present ? (
                                    <img
                                        src={profileContext(`./discord${friend.hasProfilePicture.color.toLowerCase()}.png`)}
                                        alt="Profile Picture"
                                    />
                                ) : (
                                    <img
                                        src=""
                                        alt="Profile Picture"
                                    />
                                )}
                                <p>{friend.displayName}</p>
                                <button onClick={() => handleInviteClick(friend._id)}>
                                    {loadingServerInviteMember ? (
                                        <Spinner
                                            absolute={false}
                                            height="1.5rem"
                                            width="1.5rem"
                                        />
                                    ) : (
                                        "Invite"
                                    )}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default InviteMembers;