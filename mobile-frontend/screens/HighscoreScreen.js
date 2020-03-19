import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity } from "react-native";
import socket from "../socket-handler/SocketHolder";
import {NavigationEvents} from "react-navigation";
import axios from "axios";

class HighscoreScreen extends React.Component {
  constructor(){
    super()
    this.state={
      highscoreText:'Name        Score\n----------------------------\n'
    }
  }

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  componentDidMount() {
    
  }

  async refocus() {

    const highscoreData = await axios.get("http://10.0.2.2:4001/highscores", {
        params: {}
    });
    const highscores = highscoreData.data.highscores;
    console.log(highscores)
    this.reload(highscores);
  }

  reload(highscores){
    let tmp='Name        Score\n----------------------------\n'
    highscores.forEach(item => {
      tmp = tmp+item.username +':        '+item.highscore+'\n----------------------------\n';
    })
    this.setState({ highscoreText: tmp})
  }

  render() {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    return (
        <View style={styles.container}>
        <NavigationEvents
          onDidFocus={payload => {
            this.refocus()
          }}
        />
        <Text style={styles.gameTitle}>Highscores</Text>
        <TextInput
        editable = {false}
        multiline = {true}
        value={this.state.highscoreText}
        style={styles.Box}/>

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
  Box:{
    backgroundColor:'#0077c8',
    marginBottom:10,
    paddingTop:10,
    fontSize:25,
    paddingLeft:15,
    height: 350,
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

export default HighscoreScreen;
