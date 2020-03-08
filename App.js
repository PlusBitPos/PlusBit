import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Animated,
  Dimensions,
  Easing
} from 'react-native';

import Root from './app/Root'
import Login from './app/Login'
import Dashboard from './app/Dashboard'
import Util from './app/Util'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import Keys from './components/GenerateKeys'
import Spinner from 'react-native-loading-spinner-overlay'
import FingerprintScanner from 'react-native-fingerprint-scanner';


const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default class App extends Component {

  constructor(){
    super()
    this.state = {
      root: new Animated.Value(0),
      main: new Animated.Value(0),
      dashboard: new Animated.Value(0),
      util: new Animated.Value(0),
      hashSplash: false,
      utilArg: '',
      user: {activeCoins: [], fiatUnit: ''},
      secondaryUtilArg: '',
      keys: {},
      spinner: false,
      balanceData: {totalBalance: 0.0000,BTC:{balance: 0.0000,fiatBalance: 0.00,transactions:[], status:2},ILC:{balance:0.0000,fiatBalance:0.00,transactions:[],status:2},ZEL:{balance:0.0000,fiatBalance:0.00,transactions:[],status:2},SAFE:{balance:0.0000,fiatBalance:0.00,transactions:[],status:2}},
      status: true
    }
  }
  componentDidMount(){
    RNSecureKeyStore.get("userData").then((res) => {
      let json = JSON.parse(res)
      if (json.biometrics){
        // some sort of modal for android
        FingerprintScanner.authenticate({ description: 'Scan your fingerprint on the device scanner to continue' }).then(() => {
          this.setState({modal: false})
          this.dashboard()
        }).catch((error) => {
          this.login()
        });
      } else {
        setTimeout(() => {
          this.login()
        }, 1800);
      }
    }).catch((err) => {
      setTimeout(() => {
        this.login()
      }, 1800);
    })
  }

  login = () => {
    Animated.timing(this.state.main, {
      toValue: -height,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
  }

  dashboard = () => {
    this.updateUser()
    Animated.timing(this.state.main, {
      toValue: 0,
      duration: 1000,
    }).start();
    setTimeout(() => {
      Animated.timing(this.state.root, {
        toValue: -width,
        duration: 1000,
        easing: Easing.elastic(1.2)
      }).start();
      Animated.timing(this.state.dashboard, {
        toValue: -width,
        duration: 1000,
        easing: Easing.elastic(1.2)
      }).start();
    }, 1000);
  }

  util = (arg, secondary) => {
    this.setState({utilArg: arg, secondaryUtilArg: secondary || ''})
    Animated.timing(this.state.dashboard, {
      toValue: -width * 2,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
    Animated.timing(this.state.util, {
      toValue: -width * 2,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
  }

  utilToLogin = () => {
    this.updateUser()
    Animated.timing(this.state.dashboard, {
      toValue: 0,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
    Animated.timing(this.state.util, {
      toValue: 0,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
    Animated.timing(this.state.root, {
      toValue: 0,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
    setTimeout(() => {
      this.login()
    }, 1000)
  }

  updateUser = () => {
    RNSecureKeyStore.get("userData").then((res) => {
      let json = JSON.parse(res)
      console.log(json)
      let keys = Keys(json.hash)
      this.setState({user: json, keys: keys, spinner: true})
      setInterval(() => {
        this.updateRemoteData()
      }, 30000)
      return fetch(`https://plusbit-api.libtechnologies.io/plusbit/${json.fiatUnit}/${keys.BTCaddress}/${keys.ILCaddress}/${keys.ZELaddress}/${keys.SAFEaddress}`)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({balanceData: responseJson, spinner: false, status: true})
      }).catch((error) => {
        this.setState({spinner: false, status: false})
        setTimeout(() => {
          Alert.alert("Error", "Error getting address information. Check you internet connection and try again")
        }, 200);
      })
    }, (err) => {
      this.setState({user: {activeCoins: [], fiatUnit: ''}, spinner: false})
    })
  } 

  updateRemoteData(){
    return fetch(`https://plusbit-api.libtechnologies.io/plusbit/${this.state.user.fiatUnit}/${this.state.keys.BTCaddress}/${this.state.keys.ILCaddress}/${this.state.keys.ZELaddress}/${this.state.keys.SAFEaddress}`)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log('Updating wallet data')
        this.setState({balanceData: responseJson, status: true})
      }).catch((error) => {
        this.setState({status: false})
        console.log('Network Error')
      })
  }

  utilToDashboard = () => {
    Animated.timing(this.state.dashboard, {
      toValue: -width,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
    Animated.timing(this.state.util, {
      toValue: -width,
      duration: 1000,
      easing: Easing.elastic(1.2)
    }).start();
  }

  updateFiatUnit = (unit) => {
    let user = this.state.user
    user.fiatUnit = unit
    this.setState({user: user})
    RNSecureKeyStore.set("userData", JSON.stringify(user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
          this.updateUser()
        }, (err) => {
            Alert.alert('There was an error saving profile locally')
        })
  }

  render() {
    return (
      <View style={{backgroundColor: '#222222'}}>
      <Spinner
          visible={this.state.spinner}
        overlayColor={'rgba(0,0,0,0.8)'}
      />
      <Animated.View style={[styles.container, {transform: [{translateY: this.state.main}]}]}>
        <Animated.View style={{transform: [{translateX: this.state.root}]}}>
          <Root
            hashSplash={this.state.hashSplash}
          />
        </Animated.View>
        <Animated.View style={{transform: [{translateX: this.state.dashboard}]}}>
          <Dashboard
            util={(arg, secondary) => this.util(arg, secondary)}
            user={this.state.user}
            updateUser={() => this.updateUser()}
            status={this.state.status}
            balanceData={this.state.balanceData}
          />
        </Animated.View>
        <Animated.View style={{transform: [{translateX: this.state.util}]}}>
          <Util
            page={this.state.utilArg}
            utilToLogin={() => this.utilToLogin()}
            utilToDashboard={() => this.utilToDashboard()}
            args={this.state.secondaryUtilArg}
            keys={this.state.keys}
            user={this.state.user}
            updateFiatUnit={(res) => this.updateFiatUnit(res)}
            balanceData={this.state.balanceData}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.container, {transform: [{translateY: this.state.main}]}]}>
        <Animated.View>
          <Login
            dashboard={this.dashboard}
          />
        </Animated.View>
      </Animated.View>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    height: height
  }
});