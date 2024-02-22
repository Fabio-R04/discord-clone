import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { editChannel, deleteChannel, resetServer } from "../features/server/serverSlice";
import { ITextChannel } from "../features/server/serverInterfaces";
import CloseIcon from "./svg/CloseIcon";
import DeleteIcon from "./svg/DeleteIcon";
import Spinner from "./Spinner";

export interface EditChannelData {
    channel: ITextChannel | null;
    active: boolean;
}

interface EditChannelProps {
    channel: ITextChannel;
    setEditChannel: (data: EditChannelData) => void;
}

function EditChannel({ channel, setEditChannel }: EditChannelProps) {
    const [newChannelName, setNewChannelName] = useState<string>("");
    const [deleteChannelActive, setDeleteChannelActive] = useState<boolean>(false);
    const {
        loadingServerEditChannel,
        successServer,
        messageServer
    } = useAppSelector((state) => state.server);

    const dispatch = useAppDispatch();

    useEffect(() => {
        setNewChannelName(channel.name);
    }, []);

    useEffect(() => {
        if (successServer && messageServer === "CHANNEL EDIT") {
            setEditChannel({
                channel: null,
                active: false
            });
        }
        dispatch(resetServer());
    }, [successServer, messageServer, dispatch]);

    const handleNewChannelNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setNewChannelName(event.target.value);
    }

    const saveChanges = (): void => {
        dispatch(editChannel({
            channelId: channel._id,
            newChannelName
        }));
        setNewChannelName("");
    }

    const deleteTextChannel = (): void => {
        dispatch(deleteChannel(channel._id));
    }

    return (
        <>
            <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                const target = event.target as HTMLDivElement;
                if (target.id === "edit-channel") {
                    setEditChannel({
                        channel: null,
                        active: false
                    });
                    setDeleteChannelActive(false);
                }
            }} className="edit-channel" id="edit-channel">
                {deleteChannelActive ? (
                    <div className="delete-channel__popup">
                        <div className="delete-channel__popup-top">
                            <p>Delete Channel</p>
                            <p>
                                Are you sure you want to delete <span>#{channel.name}</span>? This Cannot
                                be undone.
                            </p>
                        </div>
                        <div className="delete-channel__popup-buttons">
                            <button onClick={() => setDeleteChannelActive(false)} className="delete-channel__popup-buttons__cancel">Cancel</button>
                            <button onClick={deleteTextChannel} className="delete-channel__popup-buttons__delete">Delete Channel</button>
                        </div>
                    </div>
                ) : (
                    <div className="edit-channel__popup">
                        <div className="edit-channel__popup-heading">
                            <p>Channel Settings</p>
                            <div onClick={() => setEditChannel({
                                channel: null,
                                active: false
                            })}>
                                <CloseIcon />
                            </div>
                        </div>
                        <div className="edit-channel__popup-content">
                            <div className="edit-channel__popup-content__edit">
                                <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                                    event.preventDefault();
                                    saveChanges();
                                }} className="edit-channel__popup-content__edit-form">
                                    <label htmlFor="channel-name">CHANNEL NAME</label>
                                    <input
                                        type="text"
                                        required
                                        value={newChannelName}
                                        onChange={handleNewChannelNameChange}
                                    />
                                </form>
                            </div>
                            <div className="edit-channel__popup-content__delete">
                                <div onClick={() => setDeleteChannelActive(true)}>
                                    <p>Delete Channel</p>
                                    <DeleteIcon />
                                </div>
                            </div>
                            <div className="edit-channel__popup-content__buttons">
                                <button onClick={() => setEditChannel({
                                    channel: null,
                                    active: false
                                })} className="edit-channel__popup-content__buttons-cancel">Cancel</button>
                                <button onClick={saveChanges} className="edit-channel__popup-content__buttons-save">
                                    {loadingServerEditChannel ? (
                                        <Spinner
                                            absolute={false}
                                            height="1.7rem"
                                            width="1.7rem"
                                        />
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default EditChannel;