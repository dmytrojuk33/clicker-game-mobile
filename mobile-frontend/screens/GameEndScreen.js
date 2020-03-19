import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity, Alert } from "react-native";
import socket from "../socket-handler/SocketHolder";

class GameEndScreen extends React.Component {
  constructor(){
    super()
    this.state={
      winner: "",
      host_name: "",
      challenger_name: "",
      host_score: "",
      challenger_score: "",
    }
  }

  static navigationOptions = ({ navigation, navigationOptions}) => {
    return {
      title:''
    };
  };

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  componentDidMount() {
    const { navigation } = this.props;
    const winner = navigation.getParam("winner", "no one");
    const host_name = navigation.getParam("host_name", "no one");
    const challenger_name = navigation.getParam("challenger_name", "no one");
    const host_score = navigation.getParam("host_score", "no one");
    const challenger_score = navigation.getParam("challenger_score", "no one");
    this.setState({
      winner: winner,
      host_name: host_name,
      challenger_name: challenger_name,
      host_score: host_score,
      challenger_score: challenger_score,
    })
  }


  render() {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    return (
        <View style={styles.container}>
        <Text style={styles.gameTitle}> {this.state.winner} won! </Text>
        <TextInput
        editable = {false}
        multiline = {true}
        value={
          "                Result\n----------------------------\n"+
        this.state.host_name+': '+this.state.host_score
        +'          '+
        this.state.challenger_name+': '+this.state.challenger_score+
        "\n----------------------------\n"
        }
        style={styles.Box}/>
        <TouchableOpacity
          onPress= {()=>this.props.navigation.navigate('Menu',{
            id:id,
            username: username,
            highscore: highscore
          })}>
        <Text style={styles.btnText}>Go to Menu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress= {()=>this.props.navigation.navigate('LobbyList',{
            id:id,
            username: username,
            highscore: highscore
          })}>
        <Text style={styles.btnText}>Go to lobby list</Text>
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
    fontSize:70,
    marginBottom:30,
    fontWeight:'bold',
    color:'#fff',
    textAlign:'center',
  },
  gameInfo:{
    paddingBottom:10,
    fontSize: 15,
    marginBottom:10,
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
    fontSize:18,
    marginTop:25,
    color:'#fff',
    textAlign:'center',
    fontWeight:'bold',
  },
  Box:{
    backgroundColor:'#0077c8',
    marginBottom:10,
    paddingTop:15,
    fontSize:30,
    paddingLeft:15,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 3,
    shadowRadius: 6,
    elevation: 4,
    color:'#fff',
    textAlignVertical: 'top',
    fontWeight:'bold',
  },
})

export default GameEndScreen;