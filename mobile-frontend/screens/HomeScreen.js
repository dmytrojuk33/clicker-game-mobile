import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import accessToken from "../token-handler/TokenHolder.js";

class HomeScreen extends React.Component {
  constructor(){
    super()
    this.state={
      name:'',
      nameValidate:true,
      password:'',
      passwordValidate:true,
    }
  }

  componentWillUnmount() {
    socket.removeAllListeners();
  }

  componentDidMount() {

  }

  validate(text,type){
    alphAndNum = /^[a-zA-Z0-9@.]+$/
    if(type == 'username'){
      if(alphAndNum.test(text)){
        this.setState({
          nameValidate:true,
          name:text,

        })
      }
      else {
        this.setState({
          nameValidate:false,
        })
      }
    }
    else if(type == 'password'){
      if(alphAndNum.test(text)){
        this.setState({
          passwordValidate:true,
          password:text,
        })
      }
      else {
        this.setState({
          passwordValidate:false,
        })
      }
    }
  }

  async validateLogin(username,password){
    if(this.state.passwordValidate && this.state.nameValidate){
      //kollar om de finns i databasen och få en boolean
      const person = await axios.get("http://10.0.2.2:4001/user", {
        params: { username: username, password: password }
      })

      if(person.data.error) {
        Alert.alert(
          "Validation failed",
          person.data.error,
          [{text: 'OK', onPress: () => console.log('OK Pressed')}],
          { cancelable: false }
        )
      }

      if(person.data.id){ //ta bort sen och ersätt med en boolean
        accessToken.change(person.data.accessToken);
        this.props.navigation.navigate('Menu', {
          id: person.data.id,
          username: person.data.username,
          highscore: person.data.highscore,
        });
      }
    }
  }

  createAccount() {
      this.props.navigation.navigate('Signup');
  }

  render() {
    return (
        <View style={styles.container}>
        <Text style={styles.gameTitle}>Welcome to Clicker!</Text>
        <TextInput style={[styles.inputStyle,!this.state.nameValidate?styles.error:null]}
        onChangeText={(text)=>this.validate(text,'username')}
        placeholder="Username"/>
        <TextInput style={[styles.inputStyle,!this.state.passwordValidate?styles.error:null]}
        onChangeText={(text)=>this.validate(text,'password')}
        secureTextEntry={true}
        placeholder="Password"/>
        <TouchableOpacity
        onPress= {()=>this.validateLogin(this.state.name,this.state.password)}>
        <Text style={styles.btnText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
        onPress= {()=>this.createAccount()}>
        <Text style={styles.btnTextSingUp}>Not a member? Sign up now</Text>
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

export default HomeScreen;
