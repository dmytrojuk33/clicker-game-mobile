import React from "react";
import {Button, View, Text, Image, Platform, StyleSheet, TextInput, CheckBox, TouchableOpacity, Alert } from "react-native";
import LogoTitle from './screenComponents/LogoTitle';
import axios from "axios";

class PasswordScreen extends React.Component {
  constructor(){
    super()
    this.state={
      name:'',
      nameValidate:true,
      password:'',
      passwordValidate:true,
    }
  }

  static navigationOptions = ({ navigation, navigationOptions}) => {
    return {
      title:''
    };
  };

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

  async createUser(username, password) {
    let createPerson;
    try {
      createPerson = await axios.post("http://10.0.2.2:4001/user/create", {
        username: username,
        password: password
      });
    }
    catch(error) {
      Alert.alert(
        "Validation failed",
        "Password must be longer than 5 characters, and username shorter than 20",
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        { cancelable: false }
      )
      return;
    }
    if(createPerson.data.error) {
      Alert.alert(
        "Username already taken",
        createPerson.data.error,
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        { cancelable: false }
      )
      return;
    }

    Alert.alert(
      "Success!",
      "Your account has been created",
      [{text: 'Continue', onPress: () => console.log('OK Pressed')}],
      { cancelable: false }
    )

    console.log("created person...");
    console.log(createPerson.data);

    this.props.navigation.navigate('Profile');
  }

  render() {
    return (
        <View style={styles.container}>
        <Text style={styles.gameTitle}>Change your password</Text>
        <TextInput style={[styles.inputStyle,!this.state.nameValidate?styles.error:null]}
        onChangeText={(text)=>this.validate(text,'username')}
        placeholder="New password"/>
        <TouchableOpacity
        onPress= {()=>this.createUser(this.state.name,this.state.password)}>
        <Text style={styles.btnText}>Confirm</Text>
        </TouchableOpacity>
        </View>
        /*<Button
          title="Login"
          onPress={() => {
            //1. Navigate to the Details route with params
            this.props.navigation.navigate('Details', {
              itemId: 86,
              otherParam: 'anything you want here',
            });
          }}
        /> */

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

export default PasswordScreen;
