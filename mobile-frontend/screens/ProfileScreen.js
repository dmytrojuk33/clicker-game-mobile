import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity } from "react-native";
import axios from "axios";

class ProfileScreen extends React.Component {
  constructor(){
    super()
    this.state={
      highscore: 0
      }
    }

  static navigationOptions = ({navigation}) => ({
      title:'Profile',
  });

  async componentDidMount() {
    const highscoreData = await axios.get("http://10.0.2.2:4001/highscore", {
        params: { username: this.props.navigation.getParam('username', 'NO-ID') }
    });
    const highscore = highscoreData.data.highscore;
    this.setState({highscore: highscore});
  }


  render() {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    return (
        <View style={styles.container}>
        <Image
         style={styles.img}
         source={require('./screenComponents/blank-profile.png')}
       />
        <Text style={styles.gameTitle}>{username}</Text>
        <Text style={styles.high}>Highscore: {this.state.highscore}</Text>
        {/* <TouchableOpacity
        onPress= {()=>this.props.navigation.navigate('NewName',{
          id:id,
          username: username
        })}>
        <Text style={styles.btnText}>Change Name</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress= {()=>this.props.navigation.navigate('NewPassword',{
          id:id,
          username: username
        })}>
        <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity> */}
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
    marginBottom:10,
    fontSize:30,
    fontWeight:'bold',
    color:'#fff',
    textAlign:'center',
  },
  high:{
    paddingBottom:10,
    marginBottom:20,
    fontSize:20,
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
    marginBottom:5,
  },
  textStyle:{
    fontSize:16,
    color:'#fff',
    marginRight:10,
    marginLeft:10,
    fontWeight:'bold',
  },
  img:{
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom:30,

  },
})

export default ProfileScreen;
