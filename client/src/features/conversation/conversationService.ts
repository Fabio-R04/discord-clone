import axios from "axios";
import { URL, getConfig } from "../../reusable";
import { IConversation } from "./conversationInterfaces";

// GET
const getConversations = async (token: string | null): Promise<IConversation[]> => {
    const response = await axios.get(
        `${URL}/conversation/conversations`,
        getConfig(token)
    );
    return response.data;
}

const getConversationDetails = async (conversationId: string, token: string | null): Promise<IConversation> => {
    const response = await axios.get(
        `${URL}/conversation/details/${conversationId}`,
        getConfig(token)
    );
    return response.data;
}

// POST
const createConversation = async (targetUserId: string, token: string | null): Promise<{
    data: IConversation;
    message: string;
}> => {
    const response = await axios.post(
        `${URL}/conversation/create/${targetUserId}`,
        undefined,
        getConfig(token)
    );
    return response.data;
}

// PUT
const hideConversation = async (conversationId: string, token: string | null): Promise<IConversation> => {
    const response = await axios.put(
        `${URL}/conversation/hide-direct/${conversationId}`,
        undefined,
        getConfig(token)
    );
    return response.data;
}

const conversationService = {
    createConversation,
    getConversations,
    hideConversation,
    getConversationDetails
};
export default conversationService;