import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity } from "react-native";

class MenuScreen extends React.Component {
  constructor(){
    super()
    this.state={

    }
  }

  navigate(target) {
    const { navigation } = this.props;
    const id = navigation.getParam('id', 'NO-ID');
    const username = navigation.getParam('username', 'NO-USERNAME');
    const highscore = navigation.getParam('highscore', 'NO-HIGHSCORE');
    
    this.props.navigation.navigate(target,{
      id:id,
      username: username,
      highscore: highscore,
    });
  }

  

  render() {
    return (
        <View style={styles.container}>
        <Image
         style={styles.img}
         source={require('./screenComponents/spiro.png')}
       />
        <TouchableOpacity
        onPress= {()=>this.navigate("LobbyList")}>
        <Text style={styles.btnText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress= {()=>this.navigate("Profile")}>
        <Text style={styles.btnText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
        onPress= {()=>this.navigate("Highscore")}>
        <Text style={styles.btnText}>HighScores</Text>
        </TouchableOpacity>
        </View>

    );
  }

  

  static navigationOptions = ({navigation}) => ({
    title:'',
    headerLeft: (
      <TouchableOpacity
      onPress={()=>navigation.navigate("Home")}>
      <Text style={styles.textStyle}>Logout</Text>
      </TouchableOpacity>
    ),
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
    backgroundColor:'#004b79', //#3be8b0
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
  error:{
    borderWidth:3,
    borderColor:'red',
  },
  img:{
    width: 250,
    height: 250,
    alignSelf: 'center',
    marginBottom:60,

  },
  textStyle:{
    fontSize:16,
    color:'#fff',
    marginRight:10,
    marginLeft:10,
    fontWeight:'bold',
  }
})

export default MenuScreen;
