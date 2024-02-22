import React from "react";
import { IMessage } from "../features/message/messageInterfaces";
import Message from "./Message";
import { ConfirmDeleteData } from "../pages/Conversation";
import { useSocket } from "../contexts/SocketContext";

interface ConfirmDeleteProps {
    message: IMessage;
    from: string;
    setConfirmDelete: (data: ConfirmDeleteData) => void;
}

function ConfirmDelete({ message, from, setConfirmDelete }: ConfirmDeleteProps) {
    const socket = useSocket();
    const emitMessageDelete = (): void => {
        socket?.emit("delete-message", {
            messageId: message._id,
            from
        });
        setConfirmDelete({
            message: null,
            active: false
        });
    } 

    return (
        <div onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            const target = event.target as HTMLDivElement;
            if (target.id === "confirm-delete") {
                setConfirmDelete({
                    message: null,
                    active: false
                });
            }
        }} className="confirm-delete" id="confirm-delete">
            <div className="confirm-delete__popup">
                <div className="confirm-delete__details">
                    <h2 className="confirm-delete__heading">Delete Message</h2>
                    <p className="confirm-delete__info">
                        Are you sure you want to delete this message?
                    </p>
                    <div className="confirm-delete__message">
                        <Message
                            message={message}
                            showDelete={false}
                        />
                    </div>
                </div>
                <div className="confirm-delete__buttons">
                    <button onClick={() => setConfirmDelete({
                        message: null,
                        active: false
                    })} className="confirm-delete__buttons-cancel">Cancel</button>
                    <button onClick={() => emitMessageDelete()} className="confirm-delete__buttons-delete">Delete</button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDelete