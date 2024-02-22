import axios from "axios";
import { URL, getConfig } from "../../reusable";
import { FriendRequest, FriendsList } from "./friendInterfaces";

// GET
const getAllFriends = async (token: string | null): Promise<FriendsList> => {
    const response = await axios.get(
        `${URL}/friend/all`,
        getConfig(token)
    );

    return response.data;
}

const getPendingFriendRequests = async (token: string | null): Promise<FriendRequest[]> => {
    const response = await axios.get(
        `${URL}/friend/pending-requests`,
        getConfig(token)
    );

    return response.data;
}

// POST
const sendFriendRequest = async (targetUsername: string, token: string | null): Promise<{ success: string; outgoingRequest: FriendRequest }> => {
    const response = await axios.post(
        `${URL}/friend/send-request/${targetUsername}`,
        undefined,
        getConfig(token)
    );

    return response.data;
}

const acceptFriendRequest = async (senderId: string, token: string | null): Promise<{ friendRequestId: string; }> => {
    const response = await axios.post(
        `${URL}/friend/accept-request/${senderId}`,
        undefined,
        getConfig(token)
    );

    return response.data;
}

const rejectFriendRequest = async (data: {
    requestId: string;
    senderId: string;
    receiverId: string;
}, token: string | null): Promise<{ friendRequestId: string; }> => {
    const { requestId, senderId, receiverId } = data;

    const response = await axios.post(
        `${URL}/friend/reject-request/${requestId}`,
        {
            senderId,
            receiverId
        },
        getConfig(token)
    );

    return response.data;
}

const removeFriend = async (targetId: string, token: string | null): Promise<FriendsList> => {
    const response = await axios.post(
        `${URL}/friend/remove/${targetId}`,
        undefined,
        getConfig(token)
    );

    return response.data;
}


const friendService = {
    sendFriendRequest,
    getPendingFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriends,
    removeFriend
}
export default friendService;