let accessToken = "";

module.exports = {
    change: (newToken) => {
        accessToken = newToken;
    },
    get: () => {
        return accessToken;
    }
}