import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { createServer, resetServer } from "../features/server/serverSlice";
import CreateServerIcon from "./svg/CreateServerIcon";
import ArrowheadRightIcon from "./svg/ArrowheadRightIcon";
import GamingIcon from "./svg/GamingIcon";
import SchoolIcon from "./svg/SchoolIcon";
import StudyIcon from "./svg/StudyIcon";
import FriendIcon from "./svg/FriendIcon";
import ArtistIcon from "./svg/ArtistIcon";
import CommunityIcon from "./svg/CommunityIcon";
import CloseIcon from "./svg/CloseIcon";
import UploadIcon from "./svg/UploadIcon";
import Spinner from "./Spinner";
import toast from "react-hot-toast";

interface NewServerProps {
    setNewServerActive: (value: boolean) => void;
}

export interface ServerData {
    serverName: string;
    file?: File;
}

function NewServer({ setNewServerActive }: NewServerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [blobURL, setBlobURL] = useState<string>("");
    const [serverName, setServerName] = useState<string>("");
    const [createActive, setCreateActive] = useState<boolean>(false);
    const {
        loadingServerCreate,
        successServer,
        messageServer
    } = useAppSelector((state) => state.server);
    const { user } = useAppSelector((state) => state.auth);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setServerName(`${user.displayName}'s server`);
        }
    }, [user]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const serverId: string | null = queryParams.get("serverId");

        if (serverId) {
            queryParams.delete("serverId");
            navigate(`/server/${serverId}`, { replace: true });
        }
    }, [window.location.search, navigate]);

    useEffect(() => {
        if (successServer && messageServer === "SERVER CREATED") {
            setFile(null);
            setBlobURL("");
            setCreateActive(false);
            setNewServerActive(false);
        }

        dispatch(resetServer());
    }, [successServer, messageServer, dispatch]);

    const handleUploadClick = (): void => {
        const fileUpload: HTMLInputElement = document.querySelector("#file-create__server") as HTMLInputElement;
        fileUpload.value = "";
        fileUpload.click();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files) {
            if (!event.target.files[0].type.includes("image")) {
                toast.error("File type must be an image.");
                return;
            }

            setBlobURL(URL.createObjectURL(event.target.files[0]));
            setFile(event.target.files[0]);
        }
    }

    const handleServerNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setServerName(event.target.value);
    }

    const handleServerSubmit = (): void => {
        if (!serverName.trim()) {
            toast.error("Server name required.");
            return;
        }
        dispatch(createServer({
            serverName,
            file: file ? file : undefined
        }));
    }

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "new-server") {
                setNewServerActive(false);
                setFile(null);
                setBlobURL("");
            }
        }} className="new-server" id="new-server">
            {!createActive && (
                <div className="new-server__popup">
                    <div className="new-server__popup-heading">
                        <p>Create a server</p>
                        <p>
                            Your server is where you and your friends hang out. Make
                            yours and start talking.
                        </p>
                        <CloseIcon
                            onClick={() => setNewServerActive(false)}
                        />
                    </div>
                    <div className="new-server__popup-container">
                        <div onClick={() => setCreateActive(true)} className="new-server__popup-option">
                            <CreateServerIcon />
                            <p>Create My Own</p>
                            <ArrowheadRightIcon />
                        </div>
                        <p className="new-server__popup-other__title">
                            START FROM A TEMPLATE
                        </p>
                        <div className="new-server__popup-option">
                            <GamingIcon />
                            <p>Gaming</p>
                            <ArrowheadRightIcon />
                        </div>
                        <div className="new-server__popup-option">
                            <SchoolIcon />
                            <p>School Club</p>
                            <ArrowheadRightIcon />
                        </div>
                        <div className="new-server__popup-option">
                            <StudyIcon />
                            <p>Study Group</p>
                            <ArrowheadRightIcon />
                        </div>
                        <div className="new-server__popup-option">
                            <FriendIcon />
                            <p>Friends</p>
                            <ArrowheadRightIcon />
                        </div>
                        <div className="new-server__popup-option">
                            <ArtistIcon />
                            <p>Artists & Creators</p>
                            <ArrowheadRightIcon />
                        </div>
                        <div className="new-server__popup-option">
                            <CommunityIcon />
                            <p>Local Community</p>
                            <ArrowheadRightIcon />
                        </div>
                    </div>
                    <div className="new-server__popup-join">
                        <p>Have an invite already?</p>
                        <button>Join a Server</button>
                    </div>
                </div>
            )}
            {createActive && (
                <div className="create-server">
                    {loadingServerCreate ? (
                        <Spinner />
                    ) : (
                        <>
                            <div className="new-server__popup-heading">
                                <p>Customize your server</p>
                                <p>
                                    Give your new server a personality with a name and an
                                    icon. You can always change it later.
                                </p>
                                <CloseIcon
                                    onClick={() => {
                                        setNewServerActive(false);
                                        setFile(null);
                                        setBlobURL("");
                                    }}
                                />
                            </div>
                            <div className="create-server__container">
                                <div className="create-server__upload">
                                    {(file && blobURL) ? (
                                        <div className="create-server__upload-img">
                                            <img
                                                src={blobURL}
                                                alt="Uploaded Image"
                                                className="create-server__upload-img__image"
                                            />
                                            <div onClick={() => {
                                                setFile(null);
                                                setBlobURL("");
                                            }} className="create-server__upload-img__close">
                                                <CloseIcon />
                                            </div>
                                        </div>
                                    ) : (
                                        <UploadIcon
                                            onClick={handleUploadClick}
                                        />
                                    )}
                                    <input
                                        onChange={handleFileChange}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.gif"
                                        id="file-create__server"
                                        hidden={true}
                                    />
                                </div>
                                <div className="create-server__form">
                                    <label htmlFor="server-name">SERVER NAME</label>
                                    <input
                                        type="text"
                                        value={serverName}
                                        onChange={handleServerNameChange}
                                        id="server-name"
                                    />
                                    <p>
                                        By creating a server, you agree to Discord's <span>Community Guidelines.</span>
                                    </p>
                                </div>
                            </div>
                            <div className="create-server__buttons">
                                <button onClick={() => {
                                    setCreateActive(false);
                                    setFile(null);
                                    setBlobURL("");
                                }} className="create-server__buttons-back">Back</button>
                                <button onClick={handleServerSubmit} className="create-server__buttons-create">Create</button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default NewServer;