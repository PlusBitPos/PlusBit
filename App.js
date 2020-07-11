import React, { Component } from 'react';
import {
  Alert,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform
} from 'react-native';

import Root from './app/Root'
import Login from './app/Login'
import Dashboard from './app/Dashboard'
import Util from './app/Util'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import Keys from './components/GenerateKeys'
import Spinner from 'react-native-loading-spinner-overlay'
import FingerprintScanner from 'react-native-fingerprint-scanner';
import Modal from 'react-native-modal'
import Card from './components/Card'
import BalanceDefaults from './components/BalanceDefaults'
import crypto from 'react-native-crypto'
import { FormatBalances, CreateCryptoNoteWallet } from './components/CryptoNote';

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

const PLUSBIT_API_URL = 'https://api.plusbit.tech';

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
      user: {activeCoins: [], fiatUnit: '', password: '', username: '', activeCryptoNote: [], hash: ''},
      secondaryUtilArg: '',
      keys: {},
      spinner: false,
      balanceData: BalanceDefaults,
      status: true,
      modal: false
    }
  }
  componentDidMount(){
    RNSecureKeyStore.get("userData").then((res) => {
      let json = JSON.parse(res)
      if (json.activeCryptoNote == undefined) {
        json.activeCryptoNote = []
        RNSecureKeyStore.set("userData", JSON.stringify(json), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
            this.setState({user: json})
        })
      }
      if (json.biometrics){
        if (Platform.OS == 'ios'){
          this.iosBiometricAuthentication()
        } else {
          this.setState({modal: true})
          if (Platform.Version < 23){
            this.iosBiometricAuthentication()
          } else {
            this.iosBiometricAuthentication()
          }
        }
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

  iosBiometricAuthentication = () => {
    FingerprintScanner.authenticate({ description: 'Scan your fingerprint on the device scanner to continue' }).then(() => {
      this.setState({modal: false})
      this.dashboard()
    }).catch((error) => {
      this.setState({modal: false})
      this.login()
    });
  }

  androidCurrentAuthentication =() => {
    FingerprintScanner.authenticate({ description: 'Log in with Biometrics' }).then(() => {
        this.setState({modal: false})
        this.dashboard()
     });
  }

  androidLegacyAuthentication = () => {
    FingerprintScanner.authenticate({ onAttempt: Alert.alert('Unsccessful') }).then(() => {
      this.setState({modal: false})
      this.dashboard()
    }).catch((error) => {
      this.setState({modal: false})
      this.login()
    });
  }

  login = () => {
    this.setState({modal: false})
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
    this.refs.login.refresh()
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

  encryptString = (text) => {
    var cipher = crypto.createCipher('aes-256-ctr', 'bylibtech')
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
  }

  updateUser = () => {
    RNSecureKeyStore.get("userData").then((res) => {
      let json = JSON.parse(res)
      let keys = Keys(json.hash)
      this.setState({user: json, keys: keys, spinner: true})
      setInterval(() => {
        this.updateRemoteData()
      }, 30000)
      console.log(`${PLUSBIT_API_URL}/plusbit/${json.fiatUnit}/${keys.BTCaddress}/${keys.ILCaddress}/${keys.ZELaddress}/${keys.DASHaddress}/${keys.BTCZaddress}`)
      return fetch(`${PLUSBIT_API_URL}/plusbit/${json.fiatUnit}/${keys.BTCaddress}/${keys.ILCaddress}/${keys.ZELaddress}/${keys.DASHaddress}/${keys.BTCZaddress}`)
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
    return fetch(`${PLUSBIT_API_URL}/plusbit/${this.state.user.fiatUnit}/${this.state.keys.BTCaddress}/${this.state.keys.ILCaddress}/${this.state.keys.ZELaddress}/${this.state.keys.DASHaddress}/${this.state.keys.BTCZaddress}`)
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

  activateCryptoNoteAsset = (asset, cb) => {
    //this.setState({spinner: true})
    fetch(`http://45.76.43.226:3001/get/cf97f6ceb44ba9365cf05a713daab4d013173/${crypto.createHash("sha256").update(this.state.user.username).digest('hex')}`).then((response) => response.json()).then((responseJson) => {
      CreateCryptoNoteWallet(this.state.user.username, this.state.user.password, this.state.keys[`${asset}privatekey`], Number(responseJson), function (response) {
        //console.log(response)
      })
    }).catch((error) => {
      //this.setState({spinner: false})
      cb(false)
    })
    /*this.setState({spinner: true});
    var self = this;
    fetch(`http://45.76.43.226:8979/wallet/import/key`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json', "X-API-KEY" : 'pengolincoinpassword' },
      body: JSON.stringify({
          "daemonHost": "127.0.0.1",
          "daemonPort": 11898,
          "filename": `${this.encryptString(this.state.user.username)}.wallet`,
          "password": this.encryptString(this.state.user.hash),
          "scanHeight": 0,
          "privateViewKey": this.state.keys[`${asset}privatekey`].viewprivatekey,
          "privateSpendKey": this.state.keys[`${asset}privatekey`].spendprivatekey
        })
    })
      .then((response) => {
        if (response.status !== 200) {
          self.setState({spinner: false})
          cb(false);
        } else {
          fetch('http://45.76.43.226:8979/wallet', {
            method: 'delete',
            headers: { 'Content-Type': 'application/json', "X-API-KEY": "pengolincoinpassword" },
          }).then(res => {
            if (res.status == 200) {
              self.setState({spinner: false})
              cb(true)
            } else {
              self.setState({spinner: false})
              cb(false)
            }
          })
        }
      }).catch((error) => {
        self.setState({spinner: false})
        cb(false)
      })*/
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
            activateCryptoNoteAsset={(asset, cb) => this.activateCryptoNoteAsset(asset, cb)}
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
            password={this.state.user.password}
          />
        </Animated.View>
      </Animated.View>
      <Animated.View style={[styles.container, {transform: [{translateY: this.state.main}]}]}>
        <Animated.View>
          <Login
            ref="login"
            dashboard={this.dashboard}
          />
        </Animated.View>
      </Animated.View>
      <Modal style={styles.modal} isVisible={this.state.modal}>
        <Card justifyCenter width={width / 3.5} height={width / 3}>
          <Image style={{width: 70, height: 70}} source={require('./assets/fingerprint.png')}/>
        </Card>
      </Modal>
      </View>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    height
  },
  modal: {
    flex: 1,
    alignItems: 'center'
  }
});