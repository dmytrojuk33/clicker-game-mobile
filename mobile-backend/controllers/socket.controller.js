const sequelize = require("../models/database");
const lobbyModel = require("../models/lobby.model.js");

const PLAY_TIME = 20000;  
const LOBBY_MESSAGE_CAPACITY = 9;
const FIVE_HIGHSCORES = 5;

(function () {
  sequelize.destroyLobbies();

  //sequelize.destroyPersons();
  //sequelize.retrievePersons()
  //.then(data => {
  //  console.log(JSON.stringify(data));
  //})
})()

module.exports = (socket, io) => {

    /**
     * Token generation function
     */
    function generateToken() {
      const rand = function() {
        return Math.random().toString(36).substr(2); // remove `0.`
      };
    
      const token = function() {
          return rand() + rand(); // to make it longer
      };
      return token();
    }

    /**
     * Launch game function
     */
    function go(lobby, lobbyid) {
      const room = "lobby"+lobbyid;

      console.log("Launching game in lobby" + lobbyid);

        io.in(room).emit("launchGame", {
          lobbyid: lobbyid,
          host_id: lobby.host_id,
          challenger_id: lobby.challenger_id
        })      

        let sec = setInterval(() => {
          console.log("1 second...");
          io.in(room).emit('updateTimer');
        },1000);

        let timeout = setTimeout(async () => {
          clearInterval(sec);
          //
          const lobby = await sequelize.getLobby(lobbyid);

          winner = lobby.challenger_score > lobby.host_score ? lobby.challenger_name : lobby.host_name;
          console.log("challenger_score: " + lobby.challenger_score);
          console.log("host_score: " + lobby.host_score);
          io.in(room).emit("gameFinished", {
            lobbyid: lobbyid,
            host_name: lobby.host_name,
            challenger_name: lobby.challenger_name,
            host_score: lobby.host_score,
            challenger_score: lobby.challenger_score,
            winner: winner
          });
        }, PLAY_TIME);
    }





    socket.on("closeLobby", async (req) => {
      const lobbyid = req.lobbyid;

      const room = "lobby"+lobbyid

      socket.leave(room);

      await sequelize.deleteMessagesInLobby(lobbyid);
      await sequelize.destroyLobby(lobbyid);
      socket.to(room).emit("forceExit");
      let timeout = setTimeout(() => {
        io.emit("updateLobbyList");
      }, 500);
    });

    socket.on("leaveSocketRoom", (req) => {
      socket.leave("lobby"+req.lobbyid);
      console.log("left lobby with id ", req.lobbyid);
    })

    socket.on("leaveLobby", async (req) => {

      const lobbyid = req.lobbyid;

      const room = "lobby"+lobbyid;

      socket.leave(room);

      await sequelize.challengerLeft(lobbyid);
      socket.to(room).emit("updateOpponent", {
        opponent: ""
      });
      socket.to(room).emit("readyYellowToGreen");
    })

    socket.on("clicked", async (req) => {
      const lobbyid = req.lobbyid;
      const role = req.role;

      const room = "lobby"+lobbyid;
      const lobby = await sequelize.getLobby(lobbyid);

      if(lobby == undefined) {
        return;
      } 

      if (role === "host") {
        sequelize.incrementHostScore(lobbyid);
        console.log("host clicked!")
        console.log(lobby.host_score);
        socket.to(room).emit("updateClicks", {
          clicker: role,
          enemyScore: lobby.host_score + 1
        })
      }
      else if (role === "challenger") {
        sequelize.incrementChallengerScore(lobbyid);
        console.log("challenger clicked!")
        console.log(lobby.challenger_score);
        socket.to(room).emit("updateClicks", {
          clicker: role,
          enemyScore: lobby.challenger_score + 1
        })
      }

    });

    socket.on("mistakeClicked", async (req) => {
      const lobbyid = req.lobbyid;
      const role = req.role;

      const room = "lobby"+lobbyid;
      const lobby = await sequelize.getLobby(lobbyid);

      if(lobby == undefined) {
        return;
      } 

      if (role === "host") {
        sequelize.decreaseHostScore(lobbyid);
        console.log("host clicked!")
        console.log(lobby.host_score);
        socket.to(room).emit("updateClicks", {
          clicker: role,
          enemyScore: lobby.host_score - 3
        })
      }
      else if (role === "challenger") {
        sequelize.decreaseChallengerScore(lobbyid);
        console.log("challenger clicked!")
        console.log(lobby.challenger_score);
        socket.to(room).emit("updateClicks", {
          clicker: role,
          enemyScore: lobby.challenger_score - 3
        })
      }

    });

    socket.on("hostLogsGame", async (req) => {
      const host_id = req.host_id;
      const challenger_id = req.challenger_id;
      const lobbyid = req.lobbyid;

      const lobby = await sequelize.getLobby(lobbyid);

      await sequelize.deleteMessagesInLobby(lobbyid);
      await sequelize.logMatch(lobby.host_id, lobby.challenger_id, lobby.host_score, lobby.challenger_score);
      setTimeout(async () => {
        sequelize.destroyLobby(lobbyid);
        io.emit("updateLobbyList");
      }, 1500);
      
      console.log("Finished logging match...");
    });

    socket.on("chat", async (req) => {

      const lobbyid = req.lobbyid;
      const username = req.username;
      const msg = req.text;

      const room = "lobby"+lobbyid

      if(!msg) {
        return;
      }

      console.log("Incoming chat");
      console.log("Message is ", msg);

      await sequelize.addMessage(lobbyid, username, msg)
      const messages = await sequelize.headMessages(lobbyid, LOBBY_MESSAGE_CAPACITY)
      let list = [];
      messages.forEach((entry) => {
        list.unshift({
          sender: entry.sender_name,
          text: entry.text
        });
      })
      console.log("on 'chat': these are the messages found",JSON.stringify(messages));
      console.log("This is the lobby message is sent to:");
      
      io.in(room).emit("updateChat", {
          msgList: list
      });
    })

     /**
      * Challenger readies up
      */
     socket.on("ready", async (req) => {

      const lobbyid = req.lobbyid;
      const username = req.username;
      const id = req.id;
      const role = req.role;

      const room = "lobby"+lobbyid;

      const lobby = await sequelize.getLobby(lobbyid);

      if (role === "host") {
        await sequelize.hostReady(lobbyid);
        if (lobby.challenger_ready) {
          go(lobby,lobbyid);
        }
        else {
          socket.emit("readyRed");
          socket.to(room).emit("readyYellow");
        }
      }
      else {
        await sequelize.challengerReady(lobbyid);
        if (lobby.host_ready) {
          go(lobby,lobbyid);
        }
        else {
          socket.emit("readyRed");
          socket.to(room).emit("readyYellow");
        }
      }
      if(!lobby.host_ready || !lobby.challenger_ready) {
        socket.emit("readyRed");
        socket.to(room).emit("readyYellow");
      }
     }) 

     /**
      * Check token
      */
    socket.on("checkToken", async (req) => {
        const person_id = req.id;
        const accessToken = req.accessToken;
        const screen = req.screen;

        const result = await sequelize.checkToken(person_id, accessToken)
        console.log(result);
        if (result) {
          const token = generateToken();
          sequelize.addToken(person_id, token)
          socket.emit("tokenSuccess", {
            accessToken: token,
            screen: screen
          });
        }
        else {
          socket.emit("tokenFailure");
        }
    })


     /**
      *  Lobby is created
      */
     socket.on("created", async (req) => {

        const lobbyid = req.lobbyid;
        const room = "lobby"+lobbyid;

        console.log("Host entered lobby "+lobbyid);
        
        socket.broadcast.emit("updateLobbyList");        
        socket.join(room);
     });

     socket.on("joined", async (req) => {

        const lobbyid = req.lobbyid;
        const challenger_name = req.challenger_name;
        const challenger_id = req.challenger_id;

        console.log(JSON.stringify(req));
        
        const room = "lobby"+lobbyid;

        await sequelize.challengerJoinedLobby(lobbyid, challenger_id, challenger_name);
        const lobby = await sequelize.getLobby(lobbyid);

        

        /**
         * Retrieve lobby messages
         */
        messages = await sequelize.headMessages(lobbyid, LOBBY_MESSAGE_CAPACITY)
        let list = [];
        messages.forEach((entry) => {
            list.unshift({
            sender: entry.sender_name,
            text: entry.text
          });
        })

        socket.join(room);

        /**
         * Handle updating the frontend
         */
        socket.emit("updateChat", {
          msgList: list,
        });
        const lobbies = await sequelize.retrieveLobbies();
        console.log(JSON.stringify(lobbies));
        console.log("lobbyid: " + lobbyid);
        socket.emit("updateOpponent", {
          opponent: lobby.host_name,
        });
        socket.to(room).emit("updateOpponent", {
          opponent: challenger_name,
        });

        /**
         * Switch to a yellow ready button if host is ready
         */
        if(lobby.host_ready) {
          socket.emit("readyYellow")
        }
    })
}
