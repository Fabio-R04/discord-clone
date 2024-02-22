import axios from "axios";
import { URL, getConfig } from "../../reusable";
import { IMessage } from "./messageInterfaces";

// GET
const getMessages = async (conversationId: string, token: string | null): Promise<IMessage[]> => {
    const response = await axios.get(
        `${URL}/message/messages/${conversationId}`,
        getConfig(token)
    );
    return response.data;
}

const messageService = {
    getMessages
};
export default messageService;