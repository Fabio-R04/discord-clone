import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../app/hooks";
import { deleteServer } from "../features/server/serverSlice";
import toast from "react-hot-toast";
import Spinner from "./Spinner";

interface DeleteServerProps {
    setDeleteServerActive: (value: boolean) => void;
}

function DeleteServer({ setDeleteServerActive }: DeleteServerProps) {
    const [serverConfirmation, setServerConfirmation] = useState<string>("");
    const {
        serverDetails,
        loadingServerDelete,
        successServer,
        messageServer
    } = useAppSelector((state) => state.server);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (successServer && messageServer === "SERVER DELETED") {
            setServerConfirmation("");
            setDeleteServerActive(false);
            navigate("/");
        }
    }, [successServer, messageServer, navigate, dispatch]);

    const handleServerConfirmationChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setServerConfirmation(event.target.value);
    }

    const handleDeleteServer = (): void => {
        if (serverConfirmation !== serverDetails?.serverName) {
            toast.error("You didn't enter the server name correctly");
            return;
        }

        dispatch(deleteServer(serverDetails?._id));
    }
    
    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "delete-server") {
                setDeleteServerActive(false);
            }
        }} className="delete-server" id="delete-server">
            <div className="delete-server__popup">
                <div className="delete-server__popup-content">
                    <p className="delete-server__popup-content__heading">
                        Delete '{serverDetails?.serverName}'
                    </p>
                    <div className="delete-server__popup-content__warning">
                        <p>
                            Are you sure you want to delete <span>{serverDetails?.serverName}</span>? This<br />
                            action cannot be undone.
                        </p>
                    </div>
                    <form onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleDeleteServer();
                    }} className="delete-server__popup-content__form">
                        <label htmlFor="server-name">ENTER SERVER NAME</label>
                        <input
                            type="text"
                            value={serverConfirmation}
                            onChange={handleServerConfirmationChange}
                        />
                    </form>
                </div>
                <div className="delete-server__popup-buttons">
                    <button onClick={() => setDeleteServerActive(false)} className="delete-server__popup-buttons__cancel">Cancel</button>
                    <button onClick={handleDeleteServer} className="delete-server__popup-buttons__delete">
                        {loadingServerDelete ? (
                            <Spinner
                                absolute={false}
                                height="1.8rem"
                                width="1.8rem"
                            />
                        ) : (
                            "Delete Server"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteServer;