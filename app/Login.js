import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Easing, Alert, Image } from 'react-native';
import Card from '../components/Card'
import LineGradient from '../components/LineGradient'
import Row from '../components/Row'
import Text from '../components/Text'
import GradientButton from '../components/GradentButton'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import bcrypt from 'react-native-bcrypt'
import { sha256 } from 'react-native-sha256';
const {width, height} = Dimensions.get('window')

export default class App extends Component {

    constructor(){
        super()
        this.state = {
            isLogin: true,
            isRegister: false,
            loginPosition: new Animated.Value(Dimensions.get('window').width / 2),
            registerPosition: new Animated.Value(Dimensions.get('window').width / 2),
            loginUsername: '',
            loginPassword: '',
            registerUsername: '',
            registerPassword: '',
            confirmPassword: '',
            user: {},
            scrollSubheight: 0,
            showPsw: true,
            showCpsw: true
        }
    }

    componentDidMount(){
      this.refresh()
    }

    refresh = () => {
      this.setState({loginPassword: '', loginUsername: '', registerPassword: '', registerUsername: '', confirmPassword: '', user: {}})
      RNSecureKeyStore.get("userData")
        .then((res) => {
          this.setState({user: JSON.parse(res)})
        }, (err) => {
          this.switchToRegister()
      })
    }

    switchToRegister = () => {
      this.setState({isLogin: false, isRegister: true})
      Animated.sequence([
          Animated.timing(this.state.loginPosition, { toValue: -Dimensions.get('window').width / 2, easing: Easing.elastic(1.2),  duration: 250}),
          Animated.timing(this.state.registerPosition, { toValue: -Dimensions.get('window').width / 2, easing: Easing.elastic(1.2),  duration: 250}),
        ]).start()
  }
  switchToLogin = () => {
      this.setState({isLogin: true, isRegister: false})
      Animated.sequence([
          Animated.timing(this.state.registerPosition, { toValue: Dimensions.get('window').width / 2, easing: Easing.elastic(1.2),  duration: 250}),
          Animated.timing(this.state.loginPosition, { toValue: Dimensions.get('window').width / 2, easing: Easing.elastic(1.2),  duration: 250}),
        ]).start()
  }

  login = () => {
    if (this.state.user.username == undefined){ 
      Alert.alert('No account registered locally') 
      this.switchToRegister()
    } else {
      if (this.state.loginUsername !== this.state.user.username){ Alert.alert('No user registered with that username') } else {
        if (!bcrypt.compareSync(this.state.loginPassword, this.state.user.password)){ Alert.alert('Incorrect password') } else {
          this.props.dashboard()
        }
      }
    }
   }
   register = () => {
     if (this.state.registerPassword == '' || this.state.registerUsername == '' || this.state.confirmPassword == ''){ Alert.alert('Please fill out all fields') } else {
       if (this.state.registerPassword !== this.state.confirmPassword){ Alert.alert('Passwords do not match') } else {
        sha256(this.state.registerUsername + this.state.registerPassword).then( hash => {
          let userData = {username: this.state.registerUsername, password: bcrypt.hashSync(this.state.registerPassword, 10), biometrics: false, defaultUnit: 'coin', fiatUnit: 'USD', activeCoins: ['BTC', 'ILC'], hash: hash}
          RNSecureKeyStore.set("userData", JSON.stringify(userData), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
            this.setState({user: userData})
            this.props.dashboard()
        }, (err) => {
            Alert.alert('There was an error saving profile')
        })
        })
       }
     }
   }

  render() {
    return (
        <View style={styles.background}>
          <KeyboardAvoidingView behavior="position">
          <View style={{width: width, alignItems: 'center'}}>
          <Card justifyCenter top={height / 15} width={width / 4} height={width / 4} radius={100}>
            <Image style={{width: width / 4, height: width / 4}} source={require('../assets/logoWithBg.png')}/>
          </Card>
          <Card top={25} width={width / 1.2} height={70}>
          <Row>
                    <TouchableOpacity onPress={this.switchToLogin} style={{width: 100, alignItems: 'center', marginLeft: 70}}>
                      <Text bold>LOGIN</Text>
                      {
                          this.state.isLogin ? (
                            <LineGradient top={2} width={70}/>
                          ) : (
                            <LineGradient clear top={2} width={1}/>
                          )
                      }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.switchToRegister} style={{width: 100, alignItems: 'center', marginRight: 70}}>
                        <Text bold>REGISTER</Text>
                        {
                            this.state.isRegister ? (
                                <LineGradient top={2} width={70}/>
                            ) : (
                                <LineGradient clear top={2} width={100}/>
                            )
                        }
                    </TouchableOpacity>
                </Row>
          </Card>
          </View>
          <ScrollView style={{width: Dimensions.get('window').width, marginTop: 30}} contentContainerStyle={{alignItems: 'center'}}>
            <View style={{flexDirection: 'row'}}>
                <Animated.View style={{transform: [{translateX: this.state.loginPosition}], width: Dimensions.get('window').width, alignItems: 'center'}}>
                    <Card justifyCenter width={width / 1.2} height={50} top={this.state.scrollSubheight} radius={100}>
                        <TextInput onTouchStart={() => this.setState({scrollSubheight: 100})} onEndEditing={() => this.setState({scrollSubheight: 0})} placeholder='Username' placeholderTextColor="grey" style={styles.input} onChangeText={(loginUsername) => this.setState({loginUsername})} value={this.state.loginUsername}/>
                    </Card>
                    <Card justifyCenter width={width / 1.2} height={50} top={30} radius={100}>
                        <TextInput onTouchStart={() => this.setState({scrollSubheight: 100})} onEndEditing={() => this.setState({scrollSubheight: 0})} secureTextEntry placeholder='Password' placeholderTextColor="grey" style={styles.input} onChangeText={(loginPassword) => this.setState({loginPassword})} value={this.state.loginPassword}/>
                    </Card>
                    <GradientButton onPress={this.login} top={70} width={width / 1.2} title='LOGIN'/>
                    <Text top={-20} center padding={50} color="grey">If you have an account on another device you will need to register a new account with the same cridentials to restore your account.</Text>
                </Animated.View>
                <Animated.View style={{transform: [{translateX: this.state.registerPosition}], width: Dimensions.get('window').width, alignItems: 'center'}}>
                <Card justifyCenter width={width / 1.2} height={50} radius={100} top={this.state.scrollSubheight}>
                        <TextInput onTouchStart={() => this.setState({scrollSubheight: 100})} onEndEditing={() => this.setState({scrollSubheight: 0})} placeholder='Username' placeholderTextColor="grey" style={styles.input} onChangeText={(registerUsername) => this.setState({registerUsername})} value={this.state.registerUsername}/>
                    </Card>
                    <Card justifyCenter width={width / 1.2} height={50} top={30} radius={100}>
                        <TextInput onTouchStart={() => this.setState({scrollSubheight: 100})} onEndEditing={() => this.setState({scrollSubheight: 0})} secureTextEntry={this.state.showPsw} placeholder='Password' placeholderTextColor="grey" style={[styles.input, {width: width - 180}]} onChangeText={(registerPassword) => this.setState({registerPassword})} value={this.state.registerPassword}/>
                        <TouchableOpacity onPress={() => this.setState({showPsw: !this.state.showPsw})} style={{position: 'absolute', right: 15}}>
                          <Image style={{width: 30, height: 20}} source={require('../assets/eye.png')}/>
                        </TouchableOpacity>
                    </Card>
                    <Card justifyCenter width={width / 1.2} height={50} top={30} radius={100}>
                        <TextInput onTouchStart={() => this.setState({scrollSubheight: 100})} onEndEditing={() => this.setState({scrollSubheight: 0})} secureTextEntry={this.state.showCpsw} placeholder='Confirm Password' placeholderTextColor="grey" style={[styles.input, {width: width - 180}]} onChangeText={(confirmPassword) => this.setState({confirmPassword})} value={this.state.confirmPassword}/>
                        <TouchableOpacity onPress={() => this.setState({showCpsw: !this.state.showCpsw})} style={{position: 'absolute', right: 15}}>
                          <Image style={{width: 30, height: 20}} source={require('../assets/eye.png')}/>
                        </TouchableOpacity>
                    </Card>
                    <GradientButton onPress={this.register} top={70} width={width / 1.2} title='REGISTER'/>
                    <Text top={-20} center padding={50} color="grey">Accounts are registered locally. No account details will ever leave this device.</Text>
                </Animated.View>
            </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
  }
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#222222',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        alignItems: 'center'
    },
    logo: {
        width: width / 2.9,
        height: height / 5,
        position: 'absolute',
        right: 0
    },
    input: {
      width: Dimensions.get('window').width - 140,
      color: 'white',
      fontFamily: 'Poppins-Regular',
      textAlign: 'center',
    },
});