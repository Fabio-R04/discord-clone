import React from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { FriendRequest } from "../features/friend/friendInterfaces";
import { IUser } from "../features/auth/authInterface";
import { acceptFriendRequest, rejectFriendRequest } from "../features/friend/friendSlice";
import Spinner from "./Spinner";
import CheckIcon from "./svg/CheckIcon";
import CloseIcon from "./svg/CloseIcon";
const profileContext: any = require.context("../assets/default-profile-pictures", true);

interface HomeUserRequestProps {
    r: FriendRequest;
    sender: IUser;
    receiver: IUser;
    u: IUser;
}

function HomeUserRequest({ r, sender, receiver, u }: HomeUserRequestProps) {
    const {
        loadingFriendAccept,
        loadingFriendReject
    } = useAppSelector((state) => state.friend);
    const { user } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();

    return (
        <div className="home__content-pending__requests-all__container">
            <hr className="home__content-pending__requests-all__border" />
            <div className="home__content-pending__requests-all__request">
                {!u.hasProfilePicture.present ? (
                    <img
                        src={profileContext(`./discord${u.hasProfilePicture.color.toLowerCase()}.png`)}
                        alt="Profile Picture"
                        className="home__content-pending__requests-all__request-img"
                    />
                ) : (
                    <img
                        src={`${process.env.REACT_APP_SERVER_URL}/images/${u.hasProfilePicture.image}`}
                        alt="Profile Picture"
                        className="home__content-pending__requests-all__request-img"
                    />
                )}
                <div className="home__content-pending__requests-all__request-details">
                    <p>{u.displayName}</p>
                    <p>{sender._id === user?._id ? "Outgoing Friend Request" : "Incoming Friend Request"}</p>
                </div>
                <div className="home__content-pending__requests-all__request-interact">
                    {sender._id !== user?._id && (
                        <div onClick={() => dispatch(acceptFriendRequest(u._id))} className="home__content-pending__requests-all__request-interact__icon" id="accept" title="Accept">
                            {loadingFriendAccept ? (
                                <Spinner
                                    absolute={false}
                                    height="2rem"
                                    width="2rem"
                                />
                            ) : (
                                <CheckIcon />
                            )}
                        </div>
                    )}
                    <div onClick={() => dispatch(rejectFriendRequest({
                        requestId: r._id,
                        senderId: sender._id,
                        receiverId: receiver._id
                    }))} className="home__content-pending__requests-all__request-interact__icon" id="reject" title={sender._id !== user?._id ? "Ignore" : "Cancel"}>
                        {loadingFriendReject ? (
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

export default HomeUserRequest