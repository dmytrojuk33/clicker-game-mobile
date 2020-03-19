import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity, Alert } from "react-native";
import LogoTitle from './screenComponents/LogoTitle';
import axios from "axios";
import socket from "../socket-handler/SocketHolder.js";

class CreateLobby extends React.Component {
  constructor(){
    super()
    this.state={
      lobbyName:'NO-NAME',
      lobbyPassword:''
    }
  }

  static navigationOptions = ({ navigation, navigationOptions}) => {
    return {
      title:'Create Lobby'
    };
  };

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  navigate(target, lobbyid, lobbyname, role) {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');

    this.props.navigation.navigate(target,{
      id:id,
      username: username,
      highscore: highscore,
      role: role,
      lobbyid: lobbyid,
      lobbyName: lobbyname
    });
  }

  async onCreate() {
    const { navigation } = this.props; 
    const lobbyName = this.state.lobbyName;
    const lobbyPassword = this.state.lobbyPassword;
    if(lobbyName == "") {
      return;
    }
    let createPerson;
    try {
        createPerson = await axios.post("http://10.0.2.2:4001/lobby/create", {
            host_id: navigation.getParam('id', 'NO-ID'),
            host_name: navigation.getParam('username', 'NO-USERNAME'),
            lobby_name: lobbyName,
            password: lobbyPassword
        });
      }
      catch(error) {
        Alert.alert(
          "Failed to create lobby",
          "Servers may be busy. Try again later",
          [{text: 'CONTINUE', onPress: () => console.log('CONTINUE Pressed')}],
          { cancelable: false }
        )
        navigation.navigate("LobbyList",{
            id:id,
            username: username,
            highscore: highscore,
          });
        return;
      }

      this.navigate("Lobby", createPerson.data.lobbyid, lobbyName, "host");
  }

  render() {
    return (
        <View style={styles.container}>
        <Text style={styles.gameTitle}>Choose your lobby Name</Text>
        <TextInput style={styles.inputStyle}
        onChangeText={(input) => this.setState({lobbyName: input})}
        placeholder="Enter name"/>
        <Text style={styles.gameTitle}>Choose password</Text>
        <TextInput style={styles.inputStyle}
        onChangeText={(input) => this.setState({lobbyPassword: input})}
        placeholder="Leave blank if no password"/>
        <TouchableOpacity
        onPress= {()=>this.onCreate()}>
        <Text style={styles.btnText}>Create</Text>
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
    marginBottom:10,
    marginTop: 15,
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
    backgroundColor:'#004b79', //#3be8b0
    paddingBottom:10,
    paddingTop:10,
    fontSize:20,
    marginTop:25,
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
  }
})

export default CreateLobby;