import React from "react";
import {Button, View, Text, Image, Platform } from "react-native";
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import HomeScreen from './screens/HomeScreen';
import LobbyScreen from './screens/LobbyScreen';
import SignupScreen from './screens/SignupScreen';
import MenuScreen from './screens/MenuScreen';
import LobbyListScreen from './screens/LobbyListScreen';
import GameScreen from './screens/GameScreen';
import ProfileScreen from './screens/ProfileScreen';
import NameScreen from './screens/NameScreen';
import PasswordScreen from './screens/PasswordScreen';
import HighscoreScreen from './screens/HighscoreScreen';
import GameEndScreen from './screens/GameEndScreen';
import CreateLobbyScreen from './screens/CreateLobbyScreen';

const MainStack = createStackNavigator(
  {
    Home: HomeScreen,
    Lobby: LobbyScreen,
    Signup: SignupScreen,
    Menu: MenuScreen,
    LobbyList: LobbyListScreen,
    Profile: ProfileScreen,
    NewName: NameScreen,
    NewPassword: PasswordScreen,
    Highscore: HighscoreScreen,
    CreateLobby: CreateLobbyScreen,
  },
  {
    initialRouteName: "Home",
    /* The header config from HomeScreen is now here */
    defaultNavigationOptions: {
      title: 'Clicker',
      headerStyle: {
        backgroundColor: '#004b79', //green #01cd74
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
        textAlign:'center',
        alignSelf: 'center'
      },
    },
  }
);

const RootStack = createStackNavigator(
  {
    Main: MainStack,
    Game: GameScreen,
    GameEnd: GameEndScreen
  },
  {
    mode: 'modal',
    headerMode: 'none',
  }
);

const AppContainer = createAppContainer(RootStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
