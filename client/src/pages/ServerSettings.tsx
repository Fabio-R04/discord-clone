import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { editServer } from "../features/server/serverSlice"; 
import { getServerDetails } from "../features/server/serverSlice";
import LoadingScreen from "../components/LoadingScreen";
import DeleteIcon from "../components/svg/DeleteIcon";
import CloseIcon from "../components/svg/CloseIcon";
import toast from "react-hot-toast";
import Spinner from "../components/Spinner";
import DeleteServer from "../components/DeleteServer";

export interface EditServerData {
    serverId: string;
    removePicture: boolean;
    newServerName?: string;
    file?: File;
}

function ServerSettings() {
    const [file, setFile] = useState<File | null>(null);
    const [blobURL, setBlobURL] = useState<string>("");
    const [newServerName, setNewServerName] = useState<string>("");
    const [removeActive, setRemoveActive] = useState<boolean>(false);
    const [deleteServerActive, setDeleteServerActive] = useState<boolean>(false);
    const { serverId } = useParams();
    const { user } = useAppSelector((state) => state.auth);
    const {
        serverDetails,
        loadingServerDetails,
        loadingServerEditServer
    } = useAppSelector((state) => state.server);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (serverId) {
            dispatch(getServerDetails(serverId));
        }
    }, [serverId]);

    useEffect(() => {
        if (serverDetails) {
            if (user?._id !== serverDetails.serverOwner._id) {
                navigate("/");
            }

            if (newServerName.trim() === "") {
                setNewServerName(serverDetails.serverName);
            }
        }
    }, [serverDetails]);

    const handleServerNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setNewServerName(event.target.value);
    }

    const handleHiddenFileClick = (): void => {
        const hiddenFileInput = document.querySelector("#server-settings__file") as HTMLInputElement;
        hiddenFileInput.value = "";
        hiddenFileInput.click();
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        if (event.target.files) {
            if (!event.target.files[0].type.includes("image")) {
                toast.error("File must be an image.");
                return;
            }

            setRemoveActive(false);
            setBlobURL(URL.createObjectURL(event.target.files[0]));
            setFile(event.target.files[0]);
        }
    }

    const resetChanges = () => {
        setBlobURL("");
        setFile(null);
        setRemoveActive(false);
        setNewServerName(serverDetails?.serverName!);
    }

    const saveChanges = () => {
        dispatch(editServer({
            serverId: serverDetails?._id!,
            removePicture: removeActive ? true : false,
            newServerName,
            file: file!
        }));
    }

    return (
        <>
            {loadingServerDetails ? (
                <LoadingScreen />
            ) : (
                <div className="server-settings">
                    <nav className="server-settings__navigation">
                        <p className="server-settings__navigation-heading">
                            {serverDetails?.serverName}
                        </p>
                        <div className="server-settings__navigation-links">
                            <div className="server-settings__navigation-links__link server-settings__navigation-links__link-active">
                                <p>Overview</p>
                            </div>
                            <div onClick={() => setDeleteServerActive(true)} className="server-settings__navigation-links__link">
                                <p>Delete Server</p>
                                <DeleteIcon />
                            </div>
                        </div>
                    </nav>
                    <div className="server-settings__content">
                        <div className="server-settings__content-heading">
                            <p className="server-settings__content-heading__title">Server Overview</p>
                            <div onClick={() => navigate(`/server/${serverId}`)} className="server-settings__content-heading__exit">
                                <div>
                                    <CloseIcon />
                                </div>
                                <p>ESC</p>
                            </div>
                        </div>
                        <div className="server-settings__content-container">
                            <div className="server-settings__content-container__image">
                                <div className="server-settings__content-container__image-left">
                                    <div className="server-settings__content-container__image-left__container">
                                        {(blobURL && file) ? (
                                            <img
                                                src={blobURL}
                                                alt="Server Picture"
                                            />
                                        ) : (
                                            (serverDetails?.serverPicture.present && !removeActive) ? (
                                                <img
                                                    src={`${process.env.REACT_APP_SERVER_URL}/images/${serverDetails?.serverPicture.image}`}
                                                    alt="Server Picture"
                                                />
                                            ) : (
                                                <p className="server-settings__content-container__image-left__container-initials">{serverDetails?.serverName.split(" ").length! > 1 ? `${serverDetails?.serverName.split(" ")[0][0]}${serverDetails?.serverName.split(" ")[1][0]}` : serverDetails?.serverName[0]}</p>
                                            )
                                        )}
                                        <div onClick={handleHiddenFileClick} className="server-settings__content-container__image-left__container-hover">
                                            <p>CHANGE<br />ICON</p>
                                        </div>
                                    </div>
                                    {(serverDetails?.serverPicture.present && !removeActive) ? (
                                        <p onClick={() => {
                                            setBlobURL("");
                                            setFile(null);
                                            setRemoveActive(true);
                                        }} className="server-settings__content-container__image-left__remove">Remove</p>
                                    ) : (
                                        <p>Minimum Size: <span>128x128</span></p>
                                    )}
                                </div>
                                <div className="server-settings__content-container__image-right">
                                    <p>
                                        We recommend an image of at
                                        least 512x512 for the server.
                                    </p>
                                    <button onClick={handleHiddenFileClick}>Upload Image</button>
                                </div>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.gif"
                                    id="server-settings__file"
                                    onChange={handleFileChange}
                                    hidden={true}
                                />
                            </div>
                            <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => event.preventDefault()} className="server-settings__content-container__form">
                                <label htmlFor="server-name">SERVER NAME</label>
                                <input
                                    type="text"
                                    value={newServerName}
                                    onChange={handleServerNameChange}
                                    id="server-name"
                                />
                            </form>
                        </div>
                        <div className="server-settings__content-buttons">
                            <button onClick={resetChanges} className="server-settings__content-buttons__reset">Reset</button>
                            <button onClick={saveChanges} className="server-settings__content-buttons__save">
                                {loadingServerEditServer ? (
                                    <Spinner
                                        absolute={false}
                                        height="1.8rem"
                                        width="1.8rem"
                                    />
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {deleteServerActive && (
                <DeleteServer
                    setDeleteServerActive={setDeleteServerActive}
                />
            )}
        </>
    )
}

export default ServerSettings;