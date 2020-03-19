import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity, Icon } from "react-native";
import socket from "../socket-handler/SocketHolder.js";
import axios from "axios";

class GameScreen extends React.Component {
  constructor(){
    super()
    this.state={
      numb: 0,
      position: 0,
      opponentName: '',
      opponentClicks: 0,
      timer: 20,
      posBefore:1,
      showFalseButton: true,
      positionFalse:3,
    }
  }

  static navigationOptions = ({navigation}) => ({
      title:'',
    });

    updateNumb(){
      socket.emit("clicked", {
        lobbyid: this.props.navigation.getParam("lobbyid", 1),
        role: this.props.navigation.getParam("role", 1),
      });
      let random = 1;
      while (this.state.posBefore == random){
        let min=1; 
        let max=7;  
        random =Math.floor(Math.random() * (+max - +min)) + +min; 
      }
      this.setState({position: random, posBefore: random}) 
      this.setState( currentState =>({numb: currentState.numb + 1}))
  
      this.generateFalseButton(random)
  
    }
  
    generateFalseButton(correctPos){
      let random = correctPos
      while (random === correctPos || random === this.state.posBeforeFalse){
        let min=1; 
        let max=7;  
        random =Math.floor(Math.random() * (+max - +min)) + +min; 
      }
      this.setState({positionFalse: random, posBeforeFalse: random})   
    }
  
    updateNumbFalse(){
      socket.emit("mistakeClicked", {
        lobbyid: this.props.navigation.getParam("lobbyid", 1),
        role: this.props.navigation.getParam("role", 1),
      });
      let random = 1;
      while (this.state.posBefore == random){
        let min=1; 
        let max=7;  
        random =Math.floor(Math.random() * (+max - +min)) + +min; 
      }
      this.setState({position: random, posBefore: random}) 
      this.setState( currentState =>({numb: currentState.numb - 3}))
    }

  async componentWillUnmount() {
    socket.removeAllListeners();
  }

  componentDidMount() {

    const { navigation } = this.props;   
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const role = navigation.getParam('role', 'NO-USERNAME');

    socket.on("updateTimer", (res) => {
      this.setState({timer: this.state.timer - 1});
    })

    

    socket.on("updateClicks", (res) => {
      console.log("Updating opponent clicks...")
      console.log(res.clicker)
      console.log(res.enemyScore)
      console.log("this is me:")
      console.log(username)

      if (res.clicker !== role) {
        this.setState({ opponentClicks: res.enemyScore })
      }
    })

    socket.on("gameFinished", async (res) => {

      const lobbyid = res.lobbyid
      const host_name = res.host_name
      const challenger_name = res.challenger_name
      const host_score = res.host_score
      const challenger_score = res.challenger_score
      const winner = res.winner

      const id = this.props.navigation.getParam('id', 'NO-ID');      
      const highscore = this.props.navigation.getParam('highscore', 'NO-HIGHSCORE');
      const role = this.props.navigation.getParam('role', 'challenger');
      
      console.log("this is username when gamefinished: "+username);
      console.log("this is my role:")
      console.log(role)
      console.log("this is challenger score:")
      console.log(challenger_score)
      console.log("this is host score:")
      console.log(host_score)
      console.log("This is res:");
      console.log(res);

      if (role === "host") {
        if (host_score > highscore) {
          await this.patchHighscore(id, lobbyid);
        }
        socket.emit("hostLogsGame", {
          lobbyid: lobbyid,
        })
      }
      else if (role === "challenger" && challenger_score > highscore) {
        await this.patchHighscore(id, lobbyid);
      }
    
      socket.emit("leaveSocketRoom", {
        lobbyid: lobbyid
      });


      console.log("Navigating to GameEnd...");
      navigation.navigate('GameEnd',{
        lobbyid: res.lobbyid,
        host_name: res.host_name,
        challenger_name: res.challenger_name,
        host_score: res.host_score,
        challenger_score: res.challenger_score,
        winner: res.winner,
        id:id,
        username: username,
        highscore: highscore,
      })
    });
  }

  async patchHighscore(id, lobbyid) {
    console.log("Inside patchHighscore")
    console.log("id: ",id);
    console.log("lobbyid: ",lobbyid);

    await axios.put("http://10.0.2.2:4001/change/highscore", {
      params: {
        id: id,
        lobbyid: lobbyid,
      }
    });
  }


  render() {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    return (
        <View style={styles.container}>
        <Text style={styles.timeText}>Timer: {this.state.timer}</Text>
        <Text style={styles.opponentText}>Opponent {this.state.opponentName}: {this.state.opponentClicks}</Text>
        <Text style={styles.counter}>{this.state.numb}</Text>
        <TouchableOpacity
        style={
          this.state.position == 2?styles.clickBotton2:
          this.state.position == 3?styles.clickBotton3:
          this.state.position == 4?styles.clickBotton4:
          this.state.position == 5?styles.clickBotton5:
          this.state.position == 6?styles.clickBotton6:
          this.state.position == 7?styles.clickBotton7:
          styles.clickBotton1}
        onPress={()=>this.updateNumb()}>
        <Text style={styles.btnText}> Click me! </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
        style={
          this.state.positionFalse == 2?styles.clickBotton2:
          this.state.positionFalse == 3?styles.clickBotton3:
          this.state.positionFalse == 4?styles.clickBotton4:
          this.state.positionFalse == 5?styles.clickBotton5:
          this.state.positionFalse == 6?styles.clickBotton6:
          this.state.positionFalse == 7?styles.clickBotton7:
          styles.clickBotton1}
        onPress={()=>this.updateNumbFalse()}>
        <Text style={styles.btnText}>Cuack me!</Text>
        </TouchableOpacity>
        
        </View>

    );
  }
}

var styles = StyleSheet.create({
  container:{
    backgroundColor:'#0091cd', //#3be8b0
    flex:1,
    justifyContent: 'center',
    paddingRight: 20,
    paddingLeft: 20,
    alignItems: 'center'
  },
  opponentText:{
    paddingBottom:10,
    paddingTop:15,
    fontSize:20,
    marginBottom:10,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    position: 'absolute',
    top:0,
    right:10
  },
  timeText:{
    paddingBottom:10,
    paddingTop:15,
    fontSize:20,
    marginBottom:10,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    position: 'absolute',
    top:0,
    left:10
  },
  btnText:{
    paddingBottom:10,
    paddingTop:15,
    fontSize:20,
    marginBottom:10,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  },
  clickBotton1:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:0,
    marginBottom:45
  },
  clickBotton2:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:60,
    left:30,
    marginBottom:45
  },
  clickBotton3:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:0,
    right:20,
    marginBottom:45
  },
  clickBotton4:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:70,
    right:30,
    marginBottom:45
  },
  clickBotton5:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:0,
    left:10,
    marginBottom:45
  },
  clickBotton6:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:70,
    left:0,
    marginBottom:45
  },
  clickBotton7:{
    borderWidth:4,
    borderColor:'#0a8ea0',
    alignItems:'center',
    justifyContent:'center',
    width:100,
    height:100,
    backgroundColor:'#0abf53',
    borderRadius:50,
    position: 'absolute',
    bottom:70,
    marginBottom:45
  },
  counter:{
    fontSize:200,
    color:'#fff',
    fontWeight:'bold',
    textAlign:'center',
    position: 'absolute',
    top:100,
  },
})

export default GameScreen;