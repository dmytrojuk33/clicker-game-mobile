import SocketIO from "socket.io-client";

module.exports = SocketIO("http://10.0.2.2:4001", { transports: ["websocket"] });