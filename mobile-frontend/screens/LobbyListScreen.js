import React from "react";
import {Alert, Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity } from "react-native";
import socket from "../socket-handler/SocketHolder";
import axios from "axios";
import accessToken from "../token-handler/TokenHolder.js"
import DialogInput from 'react-native-dialog-input';
import {NavigationEvents} from "react-navigation";


class LobbyListScreen extends React.Component {
  constructor(){
    super()
    this.state={
      lobbyList: [],
      isDialogVisible: false,
      lobbyid: null,
      lobby_name: '',
      status:'',
    }
  }

  navigate(target, lobbyid, lobbyname, role) {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');

    console.log("Checking parameters...")
    console.log("lobbyid ", lobbyid)
    console.log("lobbyname ", lobbyname)
    console.log("role ", role)
    console.log("destination... ", target)

    this.props.navigation.navigate(target, {
      id:id,
      username: username,
      highscore: highscore,
      role, role,
      lobbyid: lobbyid,
      lobbyName: lobbyname
    });
  }

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  async componentDidMount() {
    //REMOVE ALL LISTENERS
  }

  refocus() {
    this.fetchLobbyList();

    socket.on("updateLobbyList", async (res) => {
      this.fetchLobbyList();
    });
  }

  /**
   * Fetch list of lobbies
   */
  async fetchLobbyList() {
    const lobbyData = await axios.get("http://10.0.2.2:4001/lobbylist", {
        params: {}
    });
    const lobbyList = lobbyData.data.lobbyList
    this.setState({lobbyList: lobbyList});
  }

  /**
   * Access token validation against database to enter 
   * protected screens lobby and create lobby
   */
  enterProtectedScreen(screen, lobbyid, lobby_name) {
    this.checkToken(screen);

    socket.on("tokenSuccess", (res) => {
      accessToken.change(res.accessToken);
      this.navigate(res.screen, lobbyid, lobby_name, "challenger");
    });
    socket.on("tokenFailure", (res) => {
      this.props.navigation.navigate("Home");
      Alert.alert(
        "Session token ended",
        "Please enter your username and password again",
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        { cancelable: false }
      )
    });
  }

  checkToken(screen) {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    
    socket.emit("checkToken", {
      id: id,
      accessToken: accessToken.get(),
      screen: screen
    })
  }

  askForPassword(lobbyid, lobby_name, status){
      this.setState({lobbyid: lobbyid, lobby_name: lobby_name, status: status});
      this.setState({isDialogVisible: true});
  }

  showDialog(bool){
    if(!bool){
      this.setState({isDialogVisible:false})
    }
  }

  async sendInput(password) {
    const response = await axios.get("http://10.0.2.2:4001/lobby/password/validate", {
        params: { password: password, lobbyid: this.state.lobbyid }
    })

    if(response.data == "success"){
      
      this.enterProtectedScreen("Lobby", this.state.lobbyid, this.state.lobby_name)
    }
    else{
      Alert.alert(
        "Error",
        "Wrong password",
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        { cancelable: false }
      )
    }
    this.setState({lobbyid: null, lobby_name: "", status: ""});
    this.setState({isDialogVisible: false});
  }

  render() {
    const lobbyGenerator = () => {
      return this.state.lobbyList.map((lobby, i)=>{
        return(
          <View key={i}>
          <TouchableOpacity
          onPress = {()=>{
            if(lobby.status === "protected"){
              this.askForPassword(lobby.id, lobby.name, lobby.status);
            }
            else if(lobby.status === "full"){
              Alert.alert(
                "Error",
                "Lobby is full",
                [{text: 'OK', onPress: () => console.log('OK Pressed')}],
                { cancelable: false }
              )
            }
            else{
              this.enterProtectedScreen("Lobby", lobby.id, lobby.name)
            }    
          }}>
          <Text style={
            lobby.status == "protected"?styles.btnProtected:
            lobby.status == "full"?styles.btnFull:
            styles.btnText
          }>{lobby.name}</Text>
          </TouchableOpacity>
          </View>
        );
      });
    }

    return (
      <View style={styles.container}>
      <NavigationEvents
        onDidFocus={payload => {
          this.refocus()
        }}
      />
      <DialogInput 
        isDialogVisible={this.state.isDialogVisible}
        title={this.state.lobby_name}
        message={"Please enter lobby password"}
        hintInput ={"Password"}
        submitInput={ (inputText) => {this.sendInput(inputText)} }
        closeDialog={ () => {this.showDialog(false)}}>
      </DialogInput>
      <Text style={styles.gameTitle}>Join a lobby!</Text>

      {lobbyGenerator()}

      <View style={styles.bottom}>
      <TouchableOpacity
      onPress= {()=>this.enterProtectedScreen("CreateLobby", null, null)}>
      <Text style={styles.btnCreate}>Create new lobby</Text>
      </TouchableOpacity>
      </View>
      </View>
    );
  }



  static navigationOptions = ({navigation}) => ({
    title:'',
    headerRight: (
      <TouchableOpacity
      onPress= {()=>navigation.navigate('Profile',{
        id: navigation.getParam('id', 'NO-ID'),
        username: navigation.getParam('username', 'NO-USERNAME'),
        highscore: navigation.getParam('highscore', 'NO-HIGHSCORE'),
      })}>
      <Text style={styles.textStyle}>{navigation.getParam('username', 'NO-USERNAME')}</Text>
      </TouchableOpacity>
    )
  });
}

var styles = StyleSheet.create({
  container:{
    backgroundColor:'#0091cd', //#3be8b0
    flex:1,
    justifyContent: 'center',
    paddingRight: 20,
    paddingLeft: 20,
  },
  bottom:{
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 10
  },
  gameTitle:{
    paddingBottom:10,
    marginBottom:25,
    fontSize:30,
    fontWeight:'bold',
    color:'#fff',
    textAlign:'center',
  },
  inputStyle:{
    backgroundColor:'#fff',
    marginBottom:10,
    paddingTop:10,
    fontSize:20,
    paddingLeft:15,
  },
  btnText:{
    backgroundColor:'#3be8b0', //#3be8b0
    paddingBottom:10,
    paddingTop:10,
    fontSize:18,
    marginBottom:10,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  },
  btnProtected:{
    backgroundColor:'#ffdd00', //#3be8b0
    paddingBottom:10,
    paddingTop:10,
    fontSize:18,
    marginBottom:10,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  },
  btnFull:{
    backgroundColor:'#be0027', //#3be8b0
    paddingBottom:10,
    paddingTop:10,
    fontSize:18,
    marginBottom:10,
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
  textStyle:{
    fontSize:16,
    color:'#fff',
    marginRight:10,
    marginLeft:10,
    fontWeight:'bold',
  },
  btnCreate:{
    backgroundColor:'#004b79', //#3be8b0
    paddingBottom:10,
    paddingTop:10,
    fontSize:18,
    marginTop:25,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  }

})

export default LobbyListScreen;
