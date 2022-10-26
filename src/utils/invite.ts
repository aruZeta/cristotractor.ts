import { clientId, permissions } from "../config.json";

const inviteLink = "https://discord.com/api/oauth2/authorize"
    + `?client_id=${clientId}`
    + `&permissions=${permissions}`
    + `&scope=bot%20applications.commands`

export {
    inviteLink
}
