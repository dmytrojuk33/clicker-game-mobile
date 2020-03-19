const express = require("express");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const { check, validationResult } = require("express-validator/check");
const database = require("./models/database");
const morgan = require("morgan");
const http = require("http");

//Controller setup
const router = require("./controllers/rest.controller")
const socketController = require("./controllers/socket.controller")

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {pingTimeout: 30000});

const bcrypt = require("bcrypt");
const salt = 10;
const saltRounds = 10;

server.listen(port, function() {
  console.log("Server listening on port " + port);
})

io.on("connection", socket => {
  console.log("New client connected socket: " + socket.id);

  socketController(socket, io);
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

// Route files
app.use("/", router);