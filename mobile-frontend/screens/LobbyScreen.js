import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity } from "react-native";
import socket from "../socket-handler/SocketHolder.js";
import {NavigationEvents} from "react-navigation";

class LobbyScreen extends React.Component {
  constructor(){
    super()
    this.state={
      text: "",
      msgList: "",
      chat: '',
      opponent: '',
      btnReady: "green",
    }
  }

  static navigationOptions = ({navigation}) => ({
    title:'                 '+navigation.getParam('lobbyName', 'NO-LOBBY'),
    headerRight: (
      <TouchableOpacity>
      <Text style={styles.textStyle}>{navigation.getParam('username', 'NO-USERNAME')}</Text>
      </TouchableOpacity>
    ),
    headerLeft: (
      <TouchableOpacity
      onPress={navigation.getParam('leaving')}>
      <Text style={styles.textStyle}>Leave Lobby</Text>
      </TouchableOpacity>
    )
  });

  componentWillUnmount() {
    socket.removeAllListeners();
  }


  componentDidMount() {
    this.props.navigation.setParams({ leaving: this.leaveScreen });
    console.log("Went into lobby");
    socket.on("updateChat", (res) => {

      let tmp = ""
      res.msgList.forEach(item => {
        tmp = tmp+item.sender +': '+item.text+'\n';
      })

      this.setState({ msgList: tmp })
    });

    /**
     * Socket reception. Write a socket.on function to 
     * handle incoming socket from server
     */

    socket.on("readyYellow", (res) => {
        this.setState({btnReady:'yellow'})
    });

    socket.on("readyRed", (res) => {
      this.setState({btnReady:'red'})
    });

    socket.on("readyGreen", (res) => {
      this.setState({btnReady:'green'})
    });

    socket.on("readyYellowToGreen", (res) => {
      if (this.state.btnReady == "yellow"){
        this.setState({btnReady:'green'})
      }
    });

    socket.on("updateOpponent", (res) => {
      console.log("opponent");
      console.log(res.opponent);
      this.setState({ opponent: res.opponent });
    });

    socket.on("launchGame", (res) => {
      console.log("launching game with this information", res);
      this.launchGame(res);
    })

    socket.on("forceExit", (res) => {
      this.forceExit();
    });

    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    const lobbyid = this.props.navigation.getParam("lobbyid", "challenger");
    const lobbyName = this.props.navigation.getParam("lobbyName", "challenger");
    const role = this.props.navigation.getParam("role", "challenger");

    if(role === "challenger") {
      socket.emit("joined", {
        lobbyid: lobbyid,
        challenger_id: id,
        challenger_name: username
      })
    }
    if(role === "host") {
      socket.emit("created", {
        lobbyid: lobbyid
      })
    }
  }


/**
 * Function executions - often prompted by socket.on
 */
  forceExit() {
    const { navigation } = this.props;

    navigation.navigate('LobbyList',{
      id: navigation.getParam('id', 'NO-ID'),
      username: navigation.getParam('username', 'NO-USERNAME'),
      highscore: navigation.getParam('highscore', 'NO-HIGHSCORE'),
    })
  }

  leaveScreen = () => {
    const { navigation } = this.props;
    if (navigation.getParam("role","challenger") === "host") {
      socket.emit("closeLobby", {
        lobbyid: navigation.getParam("lobbyid", 1),
      });
    } 
    else {
      socket.emit("leaveLobby", {
        lobbyid: navigation.getParam("lobbyid", 1),
      })
    }
    navigation.navigate('LobbyList',{
      id: navigation.getParam('id', 'NO-ID'),
      username: navigation.getParam('username', 'NO-USERNAME'),
      highscore: navigation.getParam('highscore', 'NO-HIGHSCORE'),
    })
  }

  sendMessage() {
    socket.emit("chat",{
      id: this.props.navigation.getParam("id", 0),
      lobbyid: this.props.navigation.getParam("lobbyid", 1),
      username: this.props.navigation.getParam("username", "NO-USERNAME"),
      text: this.state.text
    });
  }

  readyUp() { 
    const role = this.props.navigation.getParam("role", "challenger");
    socket.emit("ready", {
      role: this.props.navigation.getParam("role", "challenger"),
      lobbyid: this.props.navigation.getParam("lobbyid", 1),
      id: this.props.navigation.getParam("id", -1),
      username: this.props.navigation.getParam("username", "NO-USERNAME")
    });
  }

  launchGame(res) {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    
    navigation.navigate('Game',{
      id:id,
      username: username,
      highscore: highscore,
      role: navigation.getParam("role", "challenger"),
      host_id: res.host_id,
      challenger_id: res.challenger_id,
      lobbyid: res.lobbyid
    })
  }

  render() {
    return (
      <View style={styles.container}>
      <NavigationEvents
          onWillFocus={payload => {
            this.setState({ btnReady: "green" })
          }}
        />
      <Text style={styles.opponentText}>Opponent: {this.state.opponent}</Text>
      <TextInput
      editable = {false}
      multiline = {true}
      value={this.state.msgList}
      style={styles.chattBox}/>
      <TextInput style={styles.inputStyle}
      value={this.state.text}
      onChangeText={(input) => this.setState({text: input})}
      placeholder="Chat with your lobby..."/>
      <TouchableOpacity
      onPress= {()=>{this.sendMessage(); this.setState({text: ""})}}>
      <Text style={styles.btnText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity
      onPress= {() => this.readyUp()}>
      <Text style={
        this.state.btnReady === "yellow"?styles.btnYellow:
        this.state.btnReady === "red"?styles.btnRed:
        styles.btnGreen
        }>Ready</Text>
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
  },
  gameTitle:{
    paddingBottom:10,
    paddingBottom:10,
    fontSize:18,
    marginBottom:25,
    fontSize:30,
    fontWeight:'bold',
    color:'#fff',
    textAlign:'center',
  },
  inputStyle:{
    backgroundColor:'#fff',
    paddingTop:10,
    fontSize:20,
    paddingLeft:15,
  },
  btnText:{
    backgroundColor:'#004b79', //#3be8b0 blå 004b79, grön 11862f
    paddingBottom:10,
    paddingTop:10,
    fontSize:18,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  },
  btnTextSingUp:{
    fontSize:16,
    color:'#fff',
    marginTop:70,
    fontWeight:'bold',
    textAlign:'center',
  },
  error:{
    borderWidth:3,
    borderColor:'red',
  },
  chattBox:{
    backgroundColor:'#fff',
    marginBottom:10,
    paddingTop:10,
    fontSize:17,
    paddingLeft:15,
    height: 250,
    borderColor: 'gray',
    borderWidth: 1,
    color:'black',
    textAlignVertical: 'bottom'
  },
  btnGreen:{
    backgroundColor:'#11862f', //#3be8b0 blå 004b79, grön 11862f
    paddingBottom:10,
    paddingTop:10,
    fontSize:50,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    height:100,
    marginTop:20
  },
  btnYellow:{
    backgroundColor:'#ffdd00',//yellow
    paddingBottom:10,
    paddingTop:10,
    fontSize:50,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    height:100,
    marginTop:20
  },
  btnRed:{
    backgroundColor:'#be0027',//red
    paddingBottom:10,
    paddingTop:10,
    fontSize:50,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
    height:100,
    marginTop:20
  },
  textStyle:{
    fontSize:16,
    color:'#fff',
    marginRight:10,
    marginLeft:10,
    fontWeight:'bold',
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
    top:20,
    left:20
  },
})

export default LobbyScreen;
