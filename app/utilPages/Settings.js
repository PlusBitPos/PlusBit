import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert, Animated, Image, Clipboard, Linking, Platform, DeviceEventEmitter } from 'react-native';
import Card from '../../components/Card'
import Text from '../../components/Text'
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import Picker from '../../components/Picker'
import ToggleSwitch from 'toggle-switch-react-native'
import FingerprintScanner from 'react-native-fingerprint-scanner';
import AboutMessage from './AboutMessage'
import DeviceInfo from 'react-native-device-info'
import Modal from 'react-native-modal'

const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default class Settings extends Component {

    constructor(){
        super()
        this.state = {
            privKeyHeight: new Animated.Value(90),
            showPrivKeys: false,
            user: {biometrics: false},
            aboutModal: false
        }
    }

    componentDidMount(){
        console.log(this.props.props.user)
        this.setState({user: this.props.props.user})
    }

    deleteWallet = () => {
        Alert.alert(
            'Are you sure',
            'This will remove add wallet data from your device',
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Delete wallet canceled Pressed'),
                style: 'cancel',
              },
              {text: 'Delete Wallet', onPress: () => {
                RNSecureKeyStore.remove("userData")
                .then((res) => {
                  Alert.alert('Done')
                  this.props.props.utilToLogin()
                }, (err) => {
                  Alert.alert('Error deleting wallet')
                })
              }},
            ],
            {cancelable: false},
          );
    }

    privKey = () => {
        if (!this.state.showPrivKeys){
            this.setState({showPrivKeys: true})
            Animated.timing(this.state.privKeyHeight, {
                toValue: 200,
                duration: 800,
              }).start();
        } else {
            this.setState({showPrivKeys: false})
            Animated.timing(this.state.privKeyHeight, {
                toValue: 90,
                duration: 800,
              }).start();
        }
    }

    copyPrivateKey = (sym) => {
        Clipboard.setString(this.props.props.keys[`${sym}privatekey`])
        Alert.alert('Copied to clipboard')
    }

    toggleBiometrics = (res) => {
        let user = this.state.user;
        user.biometrics = res;
        if (res){
            FingerprintScanner.isSensorAvailable().then(biometryType => {
                this.setState({user: user})
                RNSecureKeyStore.set("userData", JSON.stringify(this.state.user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
                .then((res) => {
                //Alert.alert('Done')
                }, (err) => {
                user.biometrics = false
                this.setState({user: user})
                 Alert.alert('Error', 'There was an error saving user data')
                })
            }).catch(error => Alert.alert('Biometrics not available'));
        } else {
            this.setState({user: user})
            RNSecureKeyStore.set("userData", JSON.stringify(this.state.user), {accessible: ACCESSIBLE.ALWAYS_THIS_DEVICE_ONLY})
                .then((res) => {
                //Alert.alert('Done')
                }, (err) => {
                user.biometrics = false
                this.setState({user: user})
                 Alert.alert('Error', 'There was an error saving user data')
            })
        }
    }

  render() {
    return (
        <View style={styles.background}>
          <ScrollView style={{width: width, height: height - 30}} contentContainerStyle={{alignItems: 'center'}} showsVerticalScrollIndicator={false}>
            <View style={{width: width - 50, marginTop: DeviceInfo.hasNotch() == 1 ? 60 : 30}}>
                <Card justifyCenter height={40}>
                  <TouchableOpacity onPress={() => this.props.props.utilToDashboard()}>
                    <Text bold>{'<  BACK'}</Text>
                  </TouchableOpacity>
                </Card>
                <Card style={{position: 'absolute', right: 0}} justifyCenter height={40}>
                  <TouchableOpacity onPress={() => this.props.props.utilToLogin()}>
                    <Text bold>{'LOGOUT >'}</Text>
                  </TouchableOpacity>
                </Card>
            </View>
            <Card height={90} top={30} width={width - 50}>
                <TouchableOpacity onPress={this.deleteWallet} style={styles.deleteTouchable}>
                    <Text size={25} bold>Delete Wallet</Text>
                </TouchableOpacity>
            </Card>
            <Card height={this.state.privKeyHeight} top={30} width={width - 50}>
                <TouchableOpacity onPress={this.privKey} style={styles.deleteTouchable}>
                    <Text size={25} bold>Private Keys</Text>
                </TouchableOpacity>
                {
                    this.state.showPrivKeys ? (
                        <View style={{alignItems: 'flex-start', width: width - 60}}>
                          <Text left={20}>Click to copy</Text>
                          <View style={styles.iconWrapper}>
                              <TouchableOpacity onPress={() => this.copyPrivateKey('BTC')}>
                                  <Image style={styles.icon} source={require('../../assets/BTC.png')}/>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => this.copyPrivateKey('ILC')}>
                                  <Image style={styles.icon} source={require('../../assets/ILC.png')}/>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => this.copyPrivateKey('ZEL')}>
                                  <Image style={styles.icon} source={require('../../assets/ZEL.png')}/>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => this.copyPrivateKey('DASH')}>
                                  <Image style={styles.icon} source={require('../../assets/DASH.png')}/>
                              </TouchableOpacity>
                          </View>
                        </View>
                    ) : null
                }
            </Card>
            <Card top={30} width={width - 50} height={160}>
                  <Text top={15} size={20} bold>Change fiat currency</Text>
                  <Text size={12} color='grey' top={10}>Current: {this.props.props.user.fiatUnit}</Text>
                  <View><Picker top={15} onChange={(res) => this.props.props.updateFiatUnit(res)} items={[
                      {label: 'AUD', value: 'AUD'},
                      {label: 'ARS', value: 'ARS'},
                      {label: 'BRL', value: 'BRL'},
                      {label: 'CHF', value: 'CHF'},
                      {label: 'CAD', value: 'CAD'},
                      {label: 'CNY', value: 'CNY'},
                      {label: 'DKK', value: 'DKK'},
                      {label: 'EUR', value: 'EUR'},
                      {label: 'GBP', value: 'GBP'},
                      {label: 'HKD', value: 'HKD'},
                      {label: 'INR', value: 'INR'},
                      {label: 'IDR', value: 'IDR'},
                      {label: 'JPY', value: 'JPY'},
                      {label: 'KRW', value: 'KRW'},
                      {label: 'KWD', value: 'KWD'},
                      {label: 'MXN', value: 'MXN'},
                      {label: 'MYR', value: 'MYR'},
                      {label: 'NOK', value: 'NOK'},
                      {label: 'NZD', value: 'NZD'},
                      {label: 'PHP', value: 'PHP'},
                      {label: 'PLN', value: 'PLN'},
                      {label: 'PKR', value: 'PKR'},
                      {label: 'RUB', value: 'RUB'},
                      {label: 'SGD', value: 'SGD'},
                      {label: 'SAR', value: 'SAR'},
                      {label: 'SEK', value: 'SEK'},
                      {label: 'TRY', value: 'TRY'},
                      {label: 'THB', value: 'THB'},
                      {label: 'USD', value: 'USD'},
                      {label: 'UAH', value: 'UAH'},
                      {label: 'VND', value: 'VND'},
                      {label: 'ZAR', value: 'ZAR'},
                  ]} /></View>
                </Card>
                <Card justifyCenter width={width - 50} height={70} top={30}>
                  <ToggleSwitch
                    isOn={this.state.user.biometrics}
                    onColor="#00cbb3"
                    offColor="grey"
                    label="Enable Biometrics"
                    labelStyle={{ color: "white", fontFamily: 'Poppins-Regular', fontWeight: 'bold', fontSize: 15 }}
                    onToggle={isOn => this.toggleBiometrics(isOn)}
                  />
                </Card>
                <Card top={30} width={width - 50} height={320}>
                  <Text top={20} bold>About PlusBit</Text>
                  <View style={{flex: 1, padding: 20, paddingTop: 5, alignItems: 'center'}}>
                    <View style={{height: 180}}>
                       <Text style={{flex: 1}} center>{AboutMessage.full}</Text>
                    </View>
                    <TouchableOpacity style={{position: 'absolute', top: 185}} onPress={() => this.setState({aboutModal: true})}>
                      <Text color='#00cbb3'>Read More</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center', position: 'absolute', top: 270}}>
                  <TouchableOpacity onPress={() => Linking.openURL('https://plusbit.tech')} style={{marginLeft: 10, marginRight: 10}}>
                      <Image style={styles.socialIcon} source={require('../../assets/website.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://twitter.com/PlusBitPos')} style={{marginLeft: 10, marginRight: 10}}>
                      <Image style={styles.socialIcon} source={require('../../assets/twitter.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://discord.gg/9dXnmCz')} style={{marginLeft: 10, marginRight: 10}}>
                      <Image style={styles.socialIcon} source={require('../../assets/discord.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://t.me/PlusBitPos')} style={{marginLeft: 10, marginRight: 10}}>
                      <Image style={styles.socialIcon} source={require('../../assets/telegram.png')}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/plusbitofficial')} style={{marginLeft: 10, marginRight: 10}}>
                      <Image style={styles.socialIcon} source={require('../../assets/instagram.png')}/>
                    </TouchableOpacity>
                  </View>
                  {/*<Text style={{position: 'absolute', bottom: 5}} size={10} color="grey">v0.0.1</Text>*/}
                </Card>
                <Card justifyCenter top={30} width={width - 50} height={60}>
                  <View style={{alignItems: 'center'}}>
                  <Text size={12}>By using PlusBit you agree to our </Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://github.com/PlusBitPos/PrivacyPolicy')}><Text color='#00cbb3' size={12}>Privacy Policy </Text></TouchableOpacity>
                  </View>
                </Card>
                <Card bottom={Platform.OS == 'ios' ? 30 : 80} top={30} width={width - 50} height={102}>
                  <View style={{flexDirection: 'row', marginTop: 12}}>
                  <Text size={12}>From </Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://plusbit.tech')}><Text color='#00cbb3' size={12}>PlusBit </Text></TouchableOpacity>
                  <Text size={12}>© 2020 All rights reserved</Text>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text size={12}>Created by </Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://libtechnologies.io')}><Text color='#00cbb3' size={12}>L.I.B. Technologies </Text></TouchableOpacity>
                  </View>
                  <View style={{flexDirection: 'row', marginTop: 10}}>
                  <Text size={12}>Powered by </Text>
                  <TouchableOpacity onPress={() => Linking.openURL('https://zelcore.io')}><Text color='#00cbb3' size={12}>ZelCore </Text></TouchableOpacity>
                  </View>
                </Card>
          </ScrollView>
          <Modal onBackdropPress={() => this.setState({aboutModal: false})} style={styles.modal} isVisible={this.state.aboutModal}>
            <Card justifyCenter padding={10} width={width / 1.2} height={height / 1.5}>
              <ScrollView contentContainerStyle={{justifyContent: 'center', height: '100%'}}>
                <Text center size={width / 30}>{AboutMessage.full}</Text>
              </ScrollView>
            </Card>
          </Modal>
        </View>
    )
  }
};

const styles = StyleSheet.create({
    background: {
        height: Dimensions.get('window').height,
        width: width,
        alignItems: 'center',
    },
    deleteTouchable: {
        width: 277,
        height: 87,
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        height: 60,
        width: 60,
    },
    iconWrapper: {
        width: width - 60,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    socialIcon: {
      width: 30,
      height: 30
    },
    modal: {
      flex: 1,
      alignItems: 'center'
    }
});