import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { IUser } from "../features/auth/authInterface";
import { searchAllFriends } from "../features/friend/friendSlice";
import { createConversation, resetConversation } from "../features/conversation/conversationSlice";
import Spinner from "./Spinner";
const profileContext = require.context("../assets/default-profile-pictures", true);

interface SearchDMsProps {
    setSearchDMsActive: (value: boolean) => void;
}

function SearchDMs({ setSearchDMsActive }: SearchDMsProps) {
    const {
        activeConversation,
        loadingConversationCreate,
        successConversation,
        messageConversation
    } = useAppSelector((state) => state.conversation);
    const { filteredAllFriends } = useAppSelector((state) => state.friend);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (successConversation && messageConversation === "CONVERSATION CREATED") {
            setSearchDMsActive(false);
            navigate(`/conversation/${activeConversation?._id}`);
        }

        dispatch(resetConversation());
    }, [successConversation, messageConversation, dispatch]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        dispatch(searchAllFriends(event.target.value));
    }

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "search-friends") {
                setSearchDMsActive(false);
            }
        }} className="search-friends" id="search-friends">
            <p className="search-friends__heading">Search for DMs</p>
            <div className="search-friends__popup">
                <input
                    type="text"
                    placeholder="Search DMs with display name"
                    onChange={handleSearchChange}
                    className="search-friends__popup-input"
                />
                <div className="search-friends__popup-results">
                    {filteredAllFriends.length > 0 ? (
                        filteredAllFriends.map((friend: IUser) => (
                            <div onClick={() => dispatch(createConversation(friend._id))} key={friend._id} className="search-friends__popup-results__user">
                                {loadingConversationCreate ? (
                                    <Spinner />
                                ) : (
                                    !friend.hasProfilePicture.present ? (
                                        <img
                                            src={profileContext(`./discord${friend.hasProfilePicture.color.toLowerCase()}.png`)}
                                            alt="Profile Picture"
                                            className="search-friends__popup-results__user-img"
                                        />
                                    ) : (
                                        <img
                                            src=""
                                            alt="Profile Picture"
                                            className="search-friends__popup-results__user-img"
                                        />
                                    )
                                )}
                                <div className="search-friends__popup-results__user-details">
                                    <p>{friend.displayName}</p>
                                    <p>{friend.username}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="search-friends__popup-results__none">No Results</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SearchDMs;