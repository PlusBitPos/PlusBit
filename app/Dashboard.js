import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Text from '../components/Text'
import Row from '../components/Row'
import CoinCard from '../components/CoinCard'
import DeviceInfo from 'react-native-device-info'
import Modal from 'react-native-modal'
import Card from '../components/Card'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import GradentButton from '../components/GradentButton';

const height = Dimensions.get('window').height
const width = Dimensions.get('window').width

export default class Dashboard extends Component {

  constructor(){
    super()
    this.state = {
      addModal: false,
      removeModal: false,
      cryptoNoteWarning: false,
      cryptoNoteWarningAsset: ''
    }
  }

  addAsset = (sym) => {
    this.setState({addModal: false})
    this.props.user.activeCoins.push(sym)
    RNSecureKeyStore.set("userData", JSON.stringify(this.props.user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
            this.props.updateUser()
        }, (err) => {
            Alert.alert('There was an error updating user state')
        });
  }

  removeAsset = (sym) => {
    this.setState({removeModal: false})
    let i = this.props.user.activeCoins.indexOf(sym)
    this.props.user.activeCoins.splice(i, 1)
    RNSecureKeyStore.set("userData", JSON.stringify(this.props.user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
            this.props.updateUser()
        }, (err) => {
            Alert.alert('There was an error updating user state')
        });
  }

  getDisabledCryptoNoteAsset = (asset) => {
    if (asset == 'PGO') {
      if (this.props.user.activeCryptoNote.indexOf(asset) == -1){
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  activateCryptoNoteAsset = () => {
    let self = this
    this.props.activateCryptoNoteAsset(this.state.cryptoNoteWarningAsset, function(response) {
      self.setState({cryptoNoteWarning: false})
      if (!response) {
        self.setState({cryptoNoteWarningAsset: ''})
        setTimeout(() => {
          Alert.alert("Error", "There was an error activating wallet. If this problem persists contact support")
        }, 200)
      } else {
        self.props.user.activeCryptoNote.push(self.state.cryptoNoteWarningAsset)
        RNSecureKeyStore.set("userData", JSON.stringify(self.props.user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
        .then((res) => {
          self.setState({cryptoNoteWarningAsset: ''})
          self.props.updateUser()
        }, (err) => {
            Alert.alert('There was an error updating user state')
        });
      }
    })
  }

  render () {
    return (
        <View style={styles.background}>
          <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={['#363535', '#4a4949']} style={[styles.headerCard]}>
          <View style={styles.header}>
            <Image source={require('../assets/vertical-4.png')} style={styles.title}/>
             <View style={styles.balanceWrapper}>
              <Text size={28} bold>Balance</Text>
              <Text size={20}>{this.props.balanceData.totalBalance || '0.00'}</Text>
            </View>
          </View>
          </LinearGradient>
          <ScrollView style={{width: Dimensions.get('window').width, marginBottom: 70}} contentContainerStyle={{alignItems: 'center'}}>
          {
            this.props.user.activeCoins.map((item, index) => (
              <TouchableOpacity onPress={() => this.getDisabledCryptoNoteAsset(item) ? this.setState({cryptoNoteWarning: true, cryptoNoteWarningAsset: item}) : this.props.util('wallet', {name: item})} style={styles.coinWrapper}>
                 <CoinCard disabledCN={this.getDisabledCryptoNoteAsset(item)} balance={this.props.balanceData} status={this.props.status} unit={this.props.user.fiatUnit} coin={item}/>
              </TouchableOpacity>
            ))
          }
          </ScrollView>
          <View style={styles.navBar}>
            <Row>
              <TouchableOpacity style={styles.navIconWrapper} onPress={() => this.setState({addModal: true})}>
                <Image style={styles.navIcon} source={require('../assets/add.png')}/>
                <Text size={10} top={3}>Add Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navIconWrapper} onPress={() => this.setState({removeModal: true})}>
                <Image style={styles.navIcon} source={require('../assets/minus.png')}/>
                <Text size={10} top={3}>Remove Asset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navIconWrapper} onPress={() => this.props.util('settings')}>
                <Image style={styles.navIcon} source={require('../assets/gear.png')}/>
                <Text size={10} top={3}>Settings</Text>
              </TouchableOpacity>
            </Row>
          </View>

          <Modal style={styles.modal} isVisible={this.state.addModal} onBackdropPress={() => this.setState({addModal: false})}>
            <Card width={200} height={400}>
              <Text bold size={20} top={20}>Add an asset</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.addAsset('BTC')} disabled={this.props.user.activeCoins.indexOf('BTC') == -1 ? false : true} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('BTC') == -1 ? null : {opacity: 0.5}]}>
                  <Image style={styles.addIcon} source={require('../assets/BTC.png')}/>
                  <Text>Bitcoin</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.addAsset('ILC')} disabled={this.props.user.activeCoins.indexOf('ILC') == -1 ? false : true} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('ILC') == -1 ? null : {opacity: 0.5}]}>
                  <Image style={styles.addIcon} source={require('../assets/ILC.png')}/>
                  <Text>ILCoin</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.addAsset('ZEL')} disabled={this.props.user.activeCoins.indexOf('ZEL') == -1 ? false : true} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('ZEL') == -1 ? null : {opacity: 0.5}]}>
                  <Image style={styles.addIcon} source={require('../assets/ZEL.png')}/>
                  <Text>ZEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.addAsset('DASH')} disabled={this.props.user.activeCoins.indexOf('DASH') == -1 ? false : true} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('DASH') == -1 ? null : {opacity: 0.5}]}>
                  <Image style={styles.addIcon} source={require('../assets/DASH.png')}/>
                  <Text>Dash</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.addAsset('BTCZ')} disabled={this.props.user.activeCoins.indexOf('BTCZ') == -1 ? false : true} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('BTCZ') == -1 ? null : {opacity: 0.5}]}>
                  <Image style={styles.addIcon} source={require('../assets/BTCZ.png')}/>
                  <Text>BitcoinZ</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Modal>

          <Modal style={styles.modal} isVisible={this.state.removeModal} onBackdropPress={() => this.setState({removeModal: false})}>
            <Card width={200} height={400}>
              <Text bold size={20} top={20}>Remove an asset</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.removeAsset('BTC')} disabled={this.props.user.activeCoins.indexOf('BTC') == -1 ? true : false} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('BTC') == -1 ? {opacity: 0.5} : null]}>
                  <Image style={styles.addIcon} source={require('../assets/BTC.png')}/>
                  <Text>Bitcoin</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.removeAsset('ILC')} disabled={this.props.user.activeCoins.indexOf('ILC') == -1 ? true : false} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('ILC') == -1 ? {opacity: 0.5} : null]}>
                  <Image style={styles.addIcon} source={require('../assets/ILC.png')}/>
                  <Text>ILCoin</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => this.removeAsset('ZEL')} disabled={this.props.user.activeCoins.indexOf('ZEL') == -1 ? true : false} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('ZEL') == -1 ? {opacity: 0.5} : null]}>
                  <Image style={styles.addIcon} source={require('../assets/ZEL.png')}/>
                  <Text>ZEL</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.removeAsset('DASH')} disabled={this.props.user.activeCoins.indexOf('DASH') == -1 ? true : false} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('DASH') == -1 ? {opacity: 0.5} : null]}>
                  <Image style={styles.addIcon} source={require('../assets/DASH.png')}/>
                  <Text>Dash</Text>
                </TouchableOpacity>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity onPress={() => this.removeAsset('BTCZ')} disabled={this.props.user.activeCoins.indexOf('BTCZ') == -1 ? true : false} style={[{alignItems: 'center'}, this.props.user.activeCoins.indexOf('BTCZ') == -1 ? {opacity: 0.5} : null]}>
                  <Image style={styles.addIcon} source={require('../assets/BTCZ.png')}/>
                  <Text>BitcoinZ</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </Modal>

          <Modal style={styles.modal} isVisible={this.state.cryptoNoteWarning} onBackdropPress={() => this.setState({cryptoNoteWarning: false, cryptoNoteWarningAsset: ''})}>
            <Card width={250} height={200}>
              <Text size={20} top={20} bold>WARNING</Text>
              <Text size={12} center top={5}>Only activate PengolinCoin if you are planning to use it as this will initialize a sync.</Text>
              <GradentButton onPress={() => this.activateCryptoNoteAsset()} title="ACTIVATE" width={200} height={35} top={20}/>
            </Card>
          </Modal>
        </View>
    )
  }
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#222222',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
        alignItems: 'center',
        marginTop: Platform.OS == 'ios' ? 0 : -35,
    },
    logo: {
      position: 'absolute',
      width: 60,
      height: 60,
      left: 20,
      top: 35
    },
    coinWrapper: {
      width: width - 700,
      height: 110,
      marginTop: 20
    },
    card: {
      height: 110, 
      width: width - 70, 
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexDirection: 'row'
    },
    icon: {
      width: 60,
      height: 60,
      marginTop: 25
    },
    cardInfo: {
      width: 200,
      height: 80,
      marginTop: 15,
      justifyContent: 'center',
      paddingLeft: 20
    },
    arrow: {
      width: 60,
      height: 30,
      marginTop: 40
    },
    headerCard: {
      height: DeviceInfo.hasNotch() == 1 ? height / 6 : height / 5, 
      width: width, 
      justifyContent: 'center',
      alignItems: 'flex-start',
      flexDirection: 'row',
      marginTop: 0
    },
    balanceWrapper: {
      position: 'absolute',
      right: 20,
      alignItems: 'flex-end'
    },
    navIcon: {
      width: 30,
      height: 30,
    }, 
    profileWrapper: {
      position: 'absolute',
      right: 10,
      top: 10
    },
    navBar: {
      width: width,
      height: 70,
      position: 'absolute',
      bottom: 0,
      backgroundColor: '#363535'
    },
    title: {
      marginLeft: 20,
      width: 70,
      height: 70
    },
    modal: {
      flex: 1,
      alignItems: 'center',
    },
    addIcon: {
      width: 80,
      height: 80,
    },
    header: {
      width: width,
      height: 100,
      flexDirection: 'row',
      marginTop: DeviceInfo.hasNotch() == 1 ? height / 20 : height / 15,
    },
    navIconWrapper: {
      alignItems: 'center'
    },
})