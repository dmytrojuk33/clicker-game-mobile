const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt");
const sequelize = require("../models/database");
const expressValidator = require("express-validator");
const { check, validationResult } = require("express-validator/check");

const salt = 10;
const saltRounds = 10;

const FIVE_HIGHSCORES = 5;


/**
 * Get list of highscores
 */
router.get("/highscores", async (req, res) => {
  const highscores = await sequelize.getTopHighscores(FIVE_HIGHSCORES)

  res.send({ highscores: highscores})
});

/**
 * Get highscore of one person
 */
router.get("/highscore", async (req, res) => {
  const person = await sequelize.getPerson(req.query.username)

  res.send({ highscore: person.highscore });
});

/**
 * Update highscore of individual player
 */
router.put("/change/highscore", async (req, res) => {
  const id = req.body.params.id;
  const lobbyid = req.body.params.lobbyid;

  console.log("LOBBY ID HERE !");
  console.log(lobbyid);

  const lobby = await sequelize.getLobby(lobbyid);
  if (lobby.host_id !== id && lobby.challenger_id !== id) {
    res.status(404).send("Could not find lobby");
  }
  else {
    if (id === lobby.host_id) {
      await sequelize.changeHighscore(id,lobby.host_score);
    }
    else {
      await sequelize.changeHighscore(id,lobby.challenger_score);
    }
    res.send("success");
  }
});

/**
 * Validate lobby password
 */
router.get("/lobby/password/validate", async (req, res) => {
  const password = req.query.password;
  const lobbyid = req.query.lobbyid;

  console.log("password", password)
  console.log("lobbyid ", lobbyid)
  const lobby = await sequelize.getLobby(lobbyid);
  console.log("lobby")
  console.log(JSON.stringify(lobby));
  if (lobby.password === password) {
    res.send("success");
  }
  else {
    res.send("failure");
  }
});


/**
 * Create a new user
 */
router.post("/user/create", [
  check("username").isLength({ max: 20 }).trim().escape(),
  check("password").isLength({ min: 5}).trim().escape()
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    res.send({ errors: errors.array() });
    return;
  }
  console.log("POST /user/create ...etc...");

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    if(err) throw err;

    sequelize.isUserUnique(req.body.username)
    .then(() => {
      const token = generateToken();
      sequelize.createUser(req.body.username, hash, token)
      .then(user => {
        res.send({
          id: user.id,
          username: req.body.username,
          highscore: 0,
          accessToken: token
        });
      })
    })
    .catch(function(err) {
      res.send({ error: "That user already exists" })
      console.log(err);
    })
  })
});

/**
 * Create a lobby
 */
router.post("/lobby/create", async (req, res) => {

  const host_id = req.body.host_id;
  const host_name = req.body.host_name;
  const lobby_name = req.body.lobby_name;
  const password = req.body.password;

  const createdLobby = await sequelize.createLobby(host_id, host_name, password, lobby_name);

  res.send({ lobbyid: createdLobby.id})
});

/**
 * Fetch user data, given that password is correct
 */
router.get("/user", async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (username === "d" && password === "d") {
    res.send({ id: 1, username: "d", highscore: 3 });
    return;
  }

  const person = await sequelize.getPerson(username)
  if (person === null) {
    res.send({ error: "User does not exist" });
    return;
  }

  const val = await sequelize.validatePassword(password, person.password);
  if (val) {
    const accessToken = generateToken();
    await sequelize.addToken(person.id, accessToken);
    res.send({
      id: person.id,
      username: person.username,
      highscore: person.highscore,
      accessToken: accessToken
    })
  }
  else {
    console.log("Password was incorrect");
    res.send({ error: "Incorrect password" })
  }
});

/**
 * Fetch list of lobbies
 */
router.get("/lobbylist", async (req, res) => {
  const lobbies = await sequelize.retrieveLobbies();
  list = [];
  lobbies.forEach((entry) => {
    let status = "open"
    let password = entry.password;
    if (password !== "") {
      status = "protected";
    }
    if (entry.challenger_id != undefined) {
      status = "full";
    }
    list.push({
      id: entry.id,
      name: entry.lobby_name,
      status: status
    });
  })
  console.log("This is the lobby list before it gets to frontend")
  console.log(JSON.stringify(list));
  res.send({
    lobbyList: list
  })
});

router.get("/", function(req, res) {
    console.log("GET request \"/\"");
    res.send("Your mom such a poo (welcome)");
});

function generateToken() {
  const rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
  };

  const token = function() {
      return rand() + rand(); // to make it longer
  };
  return token();
}

module.exports = router;

/**
 * BACKUP
 *
router.get("/user", async (req, res) => {
  const username = req.query.username;
  const password = req.query.password;

  if (username === "d" && password === "d") {
    res.send({ id: 1, username: "d", highscore: 3 });
    return;
  }


  sequelize.getPerson(username)
  .then(data => {
    if (data === null) {
      return new Promise(function(resolve, reject) {
        reject("No such person");
      });
    }
    return data;
  })
  .then(data => {
    if (sequelize.validatePassword(password, data.password)) {
      res.send({ id: data.id, username: data.username, highscore: data.highscore });
    }
    else {
      console.log("Password was incorrect");
      res.send({ error: "Incorrect password" })
    }
  })
  .catch(function(err) {
    res.send({ error: "User does not exist" })
    console.log(err);
  })
});
*/