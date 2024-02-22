import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { createChannel, resetServer } from "../features/server/serverSlice";
import CloseIcon from "./svg/CloseIcon";
import HashtagIcon from "./svg/HashtagIcon";
import SelectedIcon from "./svg/SelectedIcon";
import SoundIcon from "./svg/SoundIcon";
import SelectIcon from "./svg/SelectIcon";

interface NewChannelProps {
    serverId: string;
    setNewChannelActive: (value: boolean) => void;
}

export interface NewChannelData {
    serverId: string;
    channelName: string;
}

function NewChannel({ serverId, setNewChannelActive }: NewChannelProps) {
    const [channelName, setChannelName] = useState<string>("");
    const {
        successServer,
        messageServer
    } = useAppSelector((state) => state.server);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (successServer && messageServer === "CHANNEL CREATED") {
            cancelChannelActive();
        }
        dispatch(resetServer());
    }, [successServer, messageServer, dispatch]);

    const cancelChannelActive = (): void => {
        setNewChannelActive(false);
        setChannelName("");
    }

    const handleChannelNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setChannelName(event.target.value);
    }

    const handleChannelSubmit = (): void => {
        if (channelName.trim() !== "") {
            dispatch(createChannel({
                serverId: serverId,
                channelName
            }));
            setChannelName("");
        }
    }

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "new-channel") {
                cancelChannelActive();
            }
        }} className="new-channel" id="new-channel">
            <div className="new-channel__popup">
                <div className="new-channel__popup-heading">
                    <div className="new-channel__popup-heading__text">
                        <p>Create Channel</p>
                        <p>in Text Channels</p>
                    </div>
                    <div onClick={cancelChannelActive} className="new-channel__popup-heading__close">
                        <CloseIcon />
                    </div>
                </div>
                <div className="new-channel__popup-details">
                    <div className="new-channel__popup-details__types">
                        <p className="new-channel__popup-details__types-heading">
                            CHANNEL TYPE
                        </p>
                        <div className="new-channel__popup-details__types-text">
                            <HashtagIcon />
                            <div>
                                <p>Text</p>
                                <p>Send messages, images, GIFs, emoji, opinions, and puns</p>
                            </div>
                            <SelectedIcon />
                        </div>
                        <div className="new-channel__popup-details__types-voice">
                            <SoundIcon />
                            <div>
                                <p>Voice</p>
                                <p>Send messages, images, GIFs, emoji, opinions, and puns</p>
                            </div>
                            <SelectIcon />
                        </div>
                    </div>
                    <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleChannelSubmit();
                    }} className="new-channel__popup-details__form">
                        <label className="new-channel__popup-details__form-label" htmlFor="channel-name">CHANNEL NAME</label>
                        <div className="new-channel__popup-details__form-field">
                            <HashtagIcon />
                            <input
                                onChange={handleChannelNameChange}
                                required
                                type="text"
                                placeholder="new-channel"
                            />
                        </div>
                    </form>
                </div>
                <div className="new-channel__popup-buttons">
                    <button onClick={cancelChannelActive} className="new-channel__popup-buttons__cancel">Cancel</button>
                    <button onClick={handleChannelSubmit} className="new-channel__popup-buttons__create">Create Channel</button>
                </div>
            </div>
        </div>
    )
}

export default NewChannel;