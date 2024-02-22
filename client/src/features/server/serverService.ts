import axios from "axios";
import { URL, getConfig } from "../../reusable";
import { ServerData } from "../../components/NewServer";
import { IServer, IServerMember, ITextChannel } from "./serverInterfaces";
import { NewChannelData } from "../../components/NewChannel";
import { InviteMemberData } from "../../components/InviteMembers";
import { IConversation } from "../conversation/conversationInterfaces";
import { JoinServerData } from "../../components/Message";
import { IMessage } from "../message/messageInterfaces";
import { EditServerData } from "../../pages/ServerSettings";

export interface InviteMemberPayload {
    conversation: IConversation;
    conversationCreated: boolean;
}

// GET
const getServers = async (token: string | null): Promise<IServerMember[]> => {
    const response = await axios.get(
        `${URL}/server/servers`,
        getConfig(token)
    );
    return response.data;
}

const getServerDetails = async (serverId: string, token: string | null): Promise<IServer> => {
    const response = await axios.get(
        `${URL}/server/details/${serverId}`,
        getConfig(token)
    );
    return response.data;
}

const getServerMembers = async (serverId: string, token: string | null): Promise<IServerMember[]> => {
    const response = await axios.get(
        `${URL}/server/members/${serverId}`,
        getConfig(token)
    );
    return response.data;
}

const getServerMessages = async (serverId: string, token: string | null): Promise<IMessage[]> => {
    const response = await axios.get(
        `${URL}/server/messages/${serverId}`,
        getConfig(token)
    );
    return response.data;
}

// POST
const createServer = async (data: ServerData, token: string | null): Promise<IServerMember> => {
    const { serverName, file } = data;

    const formData: FormData = new FormData();
    formData.append("serverName", serverName);
    if (file) formData.append("file", file);

    const response = await axios.post(
        `${URL}/server/create`,
        formData,
        getConfig(token)
    );

    return response.data;
}

const createChannel = async (data: NewChannelData, token: string | null): Promise<ITextChannel> => {
    const { serverId, channelName } = data;

    const response = await axios.post(
        `${URL}/server/new-channel/${serverId}`,
        { channelName },
        getConfig(token)
    );

    return response.data;
}

const inviteMember = async (data: InviteMemberData, token: string | null) => {
    const { serverId, targetUserId } = data;

    const response = await axios.post(
        `${URL}/server/invite-member/${serverId}`,
        { targetUserId },
        getConfig(token)
    );

    return response.data;
}

const joinServer = async (data: JoinServerData, token: string | null): Promise<IServerMember> => {
    const { serverId, memberId } = data;

    const response = await axios.post(
        `${URL}/server/join-server/${serverId}/${memberId}`,
        undefined,
        getConfig(token)
    );

    return response.data;
}

// PUT
const editChannel = async (data: { channelId: string; newChannelName: string }, token: string | null): Promise<ITextChannel> => {
    const { channelId, newChannelName } = data;

    const response = await axios.put(
        `${URL}/server/edit-channel/${channelId}`,
        { newChannelName },
        getConfig(token)
    );

    return response.data;
}

const editServer = async (data: EditServerData, token: string | null): Promise<{
    serverId: string;
    newServerName: string;
    newServerPicture: {
        present: boolean;
        image: string;
    };
}> => {
    const { serverId, removePicture, newServerName, file } = data;

    const formData: FormData = new FormData();
    if (newServerName !== undefined) formData.append("newServerName", newServerName);
    if (removePicture !== undefined) formData.append("removePicture", removePicture.toString());
    if (file) formData.append("file", file);

    const response = await axios.put(
        `${URL}/server/edit-server/${serverId}`,
        formData,
        getConfig(token)
    );

    return response.data;
}

// DELETE
const deleteChannel = async (channelId: string, token: string | null): Promise<ITextChannel> => {
    const response = await axios.delete(
        `${URL}/server/text-channel/${channelId}`,
        getConfig(token)
    );
    return response.data;
}

const deleteServer = async (serverId: string, token: string | null): Promise<string> => {
    const response = await axios.delete(
        `${URL}/server/delete-server/${serverId}`,
        getConfig(token)
    );
    return response.data;
}

const serverService = {
    createServer,
    getServers,
    getServerDetails,
    getServerMembers,
    getServerMessages,
    createChannel,
    inviteMember,
    joinServer,
    editChannel,
    deleteChannel,
    editServer,
    deleteServer
};
export default serverService;