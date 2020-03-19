/**
 * Lobby object to simplify keeping track of who played a game
 */

module.exports = function() {
  return ({
    player1: -1,
    player2: -1,
    player1_name: "",
    player2_name: "",
    lobbyid: -1,
    score1: 0,
    score2: 0,
    ready1: false,
    ready2: false,
    logged: false,
    gameTimer: {},
    reset: function() {
      this.player1 = -1;
      this.player2 = -1;
      this.player1_name = "";
      this.player2_name = "";
      this.score1 = 0;
      this.score2 = 0;
      this.ready1 = false;
      this.ready2 = false;
      this.gameTimer = {};
    }
  });
 }
