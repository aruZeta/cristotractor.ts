export default interface Config {
  bot: {
    clientId: string,
    mainGuild: {
      id: string,
      adminRoleId: string,
      insultarId: string,
    },
    permissions: string,
    userPfp: string,
  },
  letters: string,
};
