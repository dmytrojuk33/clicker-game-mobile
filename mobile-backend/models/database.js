const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");

const sequelize = new Sequelize({
  host: '2001:6b0:1:1300:250:56ff:fe01:25a',
  username: 'rafaeldadmin',
  password: 'Jai2moufoe',
  database: 'rafaeld',
  dialect: "mysql",
  define: {
        timestamps: false
    }
});

const Persons = sequelize.define('persons', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  highscore: Sequelize.INTEGER,
  access_token: Sequelize.STRING,
  token_expiration: Sequelize.DATE
});

const Matches = sequelize.define('matches', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    date: Sequelize.DATE,
    host_id: {type: Sequelize.INTEGER, references: { model: Persons, key: 'id'}},
    challenger_id: {type: Sequelize.INTEGER, references: { model: Persons, key: 'id'}},
    host_score: Sequelize.INTEGER,
    challenger_score: Sequelize.INTEGER,
    winner_id: {type: Sequelize.INTEGER, references: { model: Persons, key: 'id'}}
});

const Lobbies = sequelize.define('lobbies', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  host_id: {type: Sequelize.INTEGER, references: { model: Persons, key: 'id'}},
  challenger_id: {type: Sequelize.INTEGER, references: { model: Persons, key: 'id'}},
  host_name: Sequelize.STRING,
  challenger_name: Sequelize.STRING,
  date: Sequelize.DATE,
  password: Sequelize.STRING,
  lobby_name: Sequelize.STRING,
  host_score: Sequelize.INTEGER,
  challenger_score: Sequelize.INTEGER,
  host_ready: Sequelize.BOOLEAN,
  challenger_ready: Sequelize.BOOLEAN,
});

const Messages = sequelize.define('messages', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
  lobby_id: {type: Sequelize.INTEGER, references: { model: Lobbies, key: 'id'}},
  sender_name: Sequelize.STRING,
  text: Sequelize.STRING,
  date: Sequelize.DATE
});

module.exports = {

    /**
     * Methods for retrieving information from the database
     */
    retrieveMatches: () => { return Matches.findAll() },
    retrieveMessages: () => { return Messages.findAll() },
    retrievePersons: () => { return Persons.findAll() },
    retrieveLobbies: () => { return Lobbies.findAll() },

    headMessages: (lobbyid, amount) => {
      return Messages.findAll({
        where: {
          lobby_id: lobbyid
        },
        order: [
          ["date", "DESC"]
        ],
        limit: amount
      });
    },
    getPerson: (username) => {
      return Persons.findOne({
        where: {
          username: username
        }
      });
    },

    getLobby: (lobbyid) => {
      return Lobbies.findOne({
        where: {
          id: lobbyid
        }
      });
    },

    getTopHighscores: (amount) => {
      return Persons.findAll({
        order: [
          ["highscore", "DESC"]
        ],
        limit: amount
      })
      .then((persons) => {
        let list = []
        persons.forEach((entry) => {
          list.push({
            highscore: entry.highscore,
            username: entry.username,
          });
        })
        return list;
      })
    },

    /**
     * Create table entries
     */
    addMessage: (lobbyid, username, msg) => {
      return (
        Messages.create({
          lobby_id: lobbyid,
          sender_name: username,
          text: msg,
          date: new Date()
        })
      );
    },
    createUser: (username, password, token) => {
      const timeObject = new Date();
      return (Persons.create({
        username: username,
        password: password,
        highscore: 0,
        access_token: token,
        token_expiration: new Date(timeObject.getTime() + 90000)
      }))
    },

    createLobby: (host_id, host_name, password, lobby_name) => {
      return (Lobbies.create({
        host_id: host_id,
        challenger_id: null,
        host_name: host_name, 
        challenger_name: null,
        date: new Date(),
        password: password,
        lobby_name: lobby_name,
        host_score: 0,
        challenger_score: 0,
        host_ready: false,
        challenger_ready: false,
      }))
    },

    /**
     * Store a match entry
     */
    logMatch: (host_id, challenger_id, score1, score2) => {
      let winner_id = host_id;
      //If a tie then host_id always wins
      if (score2 > score1) {
        winner_id = challenger_id;
      }
      return (Matches.create({
        date: new Date(),
        host_id: host_id,
        challenger_id: host_id,
        host_score: score1,
        challenger_score: score2,
        winner_id: winner_id
      }))
    },

    /**
     * Change entries
     */

    addToken: (id, token) => {
      const timeObject = new Date();
      return Persons.update(
        { 
          access_token: token,
          token_expiration: new Date(timeObject.getTime() + 90000),
        },
        { 
          where: { 
            id: id 
          } 
        }
      )
    },
    changeHighscore: (id, highscore) => {
      return Persons.update(
        { 
          highscore: highscore 
        },
        { 
          where: { 
            id: id 
          } 
        }
      )
    },

    challengerLeft: (lobbyid) => {
      return Lobbies.update(
        { 
          challenger_id: null, 
          challenger_name: null, 
          challenger_ready: false,
        },
        { 
          where: { 
            id: lobbyid 
          } 
        }
      )
    },

    challengerJoinedLobby: (lobbyid, challenger_id, challenger_name) => {
      return Lobbies.update(
        { 
          challenger_id: challenger_id, 
          challenger_name: challenger_name, 
          challenger_ready: false,
        },
        { 
          where: { 
            id: lobbyid 
          } 
        }
      )
    },

    incrementHostScore: (lobbyid) => {
      return (module.exports.getLobby(lobbyid)
      .then((lobby) => {
        return Lobbies.update(
          { 
            host_score: lobby.host_score + 1 
          },
          { 
            where: { 
              id: lobbyid 
            } 
          }
        )
      }));
    },


    decreaseHostScore: (lobbyid) => {
      return (module.exports.getLobby(lobbyid)
      .then((lobby) => {
        return Lobbies.update(
          { 
            host_score: lobby.host_score - 3
          },
          { 
            where: { 
              id: lobbyid 
            } 
          }
        )
      }));
    },

    incrementChallengerScore: (lobbyid) => {
      return (module.exports.getLobby(lobbyid)
      .then((lobby) => {
        return Lobbies.update(
          { 
            challenger_score: lobby.challenger_score + 1 
          },
          { 
            where: { 
              id: lobbyid 
            } 
          }
        )
      }));
    },

    decreaseChallengerScore: (lobbyid) => {
      return (module.exports.getLobby(lobbyid)
      .then((lobby) => {
        return Lobbies.update(
          { 
            challenger_score: lobby.challenger_score - 3
          },
          { 
            where: { 
              id: lobbyid 
            } 
          }
        )
      }));
    },

    hostReady: (lobbyid) => {
      return Lobbies.update(
        { 
          host_ready: true 
        },
        { 
          where: { 
            id: lobbyid 
          } 
        }
      );
    },

    challengerReady: (lobbyid) => {
      return Lobbies.update(
        { 
          challenger_ready: true 
        },
        { 
          where: { 
            id: lobbyid 
          } 
        }
      );
    },


    /**
     * Checks made against the database
     */
    checkToken: (person_id, accessToken) => {
      return Persons.findOne({
        where: {
          id: person_id
        }
      })
      .then(person => {
        console.log("access_token looks like...");
        console.log(person.access_token);
        console.log("client accessToken looks like...");
        console.log(accessToken);
        if (person.access_token === accessToken) {
        console.log("token_expiration looks like...");
        console.log(person.token_expiration);
        console.log("current time looks like this...")
        console.log(new Date())
        console.log("token_expiration time (getTime) looks like this...")
        console.log(person.token_expiration.getTime())
        console.log("current time (getTime) looks like this...")
        console.log(new Date().getTime())
          if(new Date().getTime() < person.token_expiration.getTime()) {
            return true;
          }
        }
        return false;
      })
    },

    validatePassword: (password, hash) => {
      return bcrypt.compareSync(password, hash);
    },

    isUserUnique: (username) => {
      return Persons.count({
        where: { username: username }
        })
        .then(count => {
          if (count != 0) {
            return new Promise((resolve, reject) => {
              return reject("rejected");
            })
          }
          return new Promise((resolve, reject) => {
            return resolve("resolve");
          })
        })
    },

    /**
     * Delete entries
     */
    deleteMessagesInLobby(lobbyid) {
      return Messages.destroy({
        where: { lobby_id: lobbyid }
      });
    },

    destroyLobby(lobbyid) {
      return Lobbies.destroy({
        where: { id: lobbyid }
      });
    },


    /**
     * Drop tables
     */
    destroyPersons: () => {
      return Persons.destroy({
        where: {}
      })
    },
    destroyLobbies: () => {
      return Lobbies.destroy({
        where: {}
      })
    },
    destroyMessages: () => {
      return Messages.destroy({
        where: {}
      })
    },
    destroyMatches: () => {
      return Matches.destroy({
        where: {}
      })
    }
};
