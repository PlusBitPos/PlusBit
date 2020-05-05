import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Animated, TouchableOpacity, ScrollView, KeyboardAvoidingView, TextInput, Image, Clipboard, Alert, Platform } from 'react-native';
import Card from '../../components/Card'
import Text from '../../components/Text'
import WalletHeader from '../../components/WalletHeader'
import Row from '../../components/Row'
import LineGradient from '../../components/LineGradient'
import DeviceInfo from 'react-native-device-info'
import txs from './exampleTxs'
import GradientButton from '../../components/GradentButton'
import transaction from '../../components/Transactions'
import Spinner from 'react-native-loading-spinner-overlay'
import QRCodeScanner from 'react-native-qrcode-scanner';
import Modal from 'react-native-modal'
import Android_QR from 'react-qr-code';
import IOS_QR from 'react-native-qr-generator'
import bcrypt from 'react-native-bcrypt'
import moment from 'moment'


const width = Dimensions.get('window').width
const height = Dimensions.get('window').height

export default class Wallet extends Component {

    constructor(props){
        super(props)
        this.state = {
            isActivity: true,
            isReceive: false,
            isSend : false,
            fee: 0.0000452,
            address: '',
            amount: 0,
            spinner: false,
            feeButtons: {
                left: 'white',
                middle: 'grey',
                right: 'grey'
            },
            qrModal: false,
            errorIndex: '',
            sucessModal: false,
            heightList: props.props.balanceData,
            isMax: false,
            password: '',
            passwordModal: false
        }
    }

    changeFee = (type) => {
        if (type == 'economy') {
            this.setState({feeButtons: {left: 'white', middle: 'grey', right: 'grey'}, fee: 0.0000452})
            if (this.state.isMax) this.setState({amount: String((Number(this.getCoinInfo().balance) - 0.0000452).toFixed(8))})
        } else if (type == 'standard') {
            this.setState({feeButtons: {left: 'grey', middle: 'white', right: 'grey'}, fee: 0.0002265})
            if (this.state.isMax) this.setState({amount: String((Number(this.getCoinInfo().balance) - 0.0002265).toFixed(8))})
        } else if (type == 'fast') {
            this.setState({feeButtons: {left: 'grey', middle: 'grey', right: 'white'}, fee: 0.0004068})
            if (this.state.isMax) this.setState({amount: String((Number(this.getCoinInfo().balance) - 0.0004068).toFixed(8))})
        }
    }

    switchToReceive = () => {
        this.setState({isActivity: false, isReceive: true, isSend: false})
    }

    SwitchToActivity = () => {
        this.setState({isActivity: true, isReceive: false, isSend: false})
    }

    SwitchToSend = () => {
        this.setState({isActivity: false, isReceive: false, isSend: true})
    }

    getCoinInfo = () => {
        if (this.props.props.args.name == 'BTC'){
            return {
                clipboard: require('../../assets/BTC-clipboard.png'),
                color: 'rgb(233, 122, 22)',
                qr: require('../../assets/BTC-qr.png'),
                paste: require('../../assets/BTC-paste.png'),
                balance: this.props.props.balanceData.BTC.balance
            }
        } else if (this.props.props.args.name == 'ILC'){
            return {
                clipboard: require('../../assets/ILC-clipboard.png'),
                color: 'rgb(22, 112, 134)',
                qr: require('../../assets/ILC-qr.png'),
                paste: require('../../assets/ILC-paste.png'),
                balance: this.props.props.balanceData.ILC.balance
            }
        } else if (this.props.props.args.name == 'ZEL'){
            return {
                clipboard: require('../../assets/ZEL-clipboard.png'),
                color: 'rgb(54, 17, 101)',
                qr: require('../../assets/ZEL-qr.png'),
                paste: require('../../assets/ZEL-paste.png'),
                balance: this.props.props.balanceData.ZEL.balance
            }
        } else if (this.props.props.args.name == 'DASH'){
            return {
                clipboard: require('../../assets/DASH-clipboard.png'),
                color: 'rgb(14, 119, 221)',
                qr: require('../../assets/DASH-qr.png'),
                paste: require('../../assets/DASH-paste.png'),
                balance: this.props.props.balanceData.DASH.balance
            }
        }
    }

    copyAddress = () => {
        console.log(this.props.props.keys[`${this.props.props.args.name}address`])
        Clipboard.setString(this.props.props.keys[`${this.props.props.args.name}address`])
        Alert.alert('Copied to clipboard')
    }

    sendTx = async () => {
        let self = this
        this.setState({spinner: true})
        transaction({
            to: this.state.address,
            amount: Number(this.state.amount),
            fee: Number(this.state.fee),
            from: this.props.props.keys[`${this.props.props.args.name}address`],
            priv: this.props.props.keys[`${this.props.props.args.name}privatekey`],
            bls: this.props.props.balanceData,
            coin: this.props.props.args.name,
            stageFunction: (error) => {
                this.setState({errorIndex: error})
            }
        },
        function(result){
            self.setState({spinner: false})
            if (result.status == 2){
                Alert.alert('Error', result.message)
            } else if (result.status == 1){
                self.SwitchToActivity()
                self.setState({sucessModal: true, address: '', amount: 0})
                self.changeFee('economy')
            }
        })
    }

    max = () => {
        this.setState({amount: String((Number(this.getCoinInfo().balance) - Number(this.state.fee)).toFixed(8)), isMax: true})
    }

    disMount = () => {
        this.setState({address: '', amount: ''})
        this.changeFee('economy')
        this.SwitchToActivity()
    }

    onQrCodeScan = (e) => {
        this.setState({address: e.data, qrModal: false})
      }

    expand(i){
        let hl = this.state.heightList
        if (hl[this.props.props.args.name].heightList[i] == 65) {
           hl[this.props.props.args.name].heightList[i] = 200
           this.setState({heightList: hl})
        } else {
            hl[this.props.props.args.name].heightList[i] = 65
            this.setState({heightList: hl})
        }
    }

    send = () => {
        if (!bcrypt.compareSync(this.state.password, this.props.password)) { Alert.alert('Incorrect Password') } else {
            this.setState({passwordModal: false, password: ''})
            this.sendTx()
        }
    }

  render() {
    return (
        <View style={styles.background}>
        <Spinner
          visible={this.state.spinner}
          overlayColor={'rgba(0,0,0,0.8)'}
        />
        <KeyboardAvoidingView behavior="padding">
            <WalletHeader balance={this.props.props.balanceData} fiatUnit={this.props.props.user.fiatUnit} coin={this.props.props.args.name}>
              <Row style={styles.toggle}>
                    <TouchableOpacity onPress={this.SwitchToActivity} style={{width: 100, alignItems: 'center', marginLeft: 20}}>
                      <Text size={18} bold>ACTIVITY</Text>
                      {
                          this.state.isActivity ? (
                            <LineGradient color='white' top={2} width={100}/>
                          ) : (
                            <LineGradient clear top={2} width={1}/>
                          )
                      }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.SwitchToSend} style={{width: 100, alignItems: 'center', marginRight: 0}}>
                        <Text size={18} bold>SEND</Text>
                        {
                            this.state.isSend ? (
                                <LineGradient color='white' top={2} width={100}/>
                            ) : (
                                <LineGradient clear top={2} width={100}/>
                            )
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.switchToReceive} style={{width: 100, alignItems: 'center', marginRight: 20}}>
                        <Text size={18} bold>RECEIVE</Text>
                        {
                            this.state.isReceive ? (
                                <LineGradient color='white' top={2} width={100}/>
                            ) : (
                                <LineGradient clear top={2} width={100}/>
                            )
                        }
                    </TouchableOpacity>                
                </Row>
            </WalletHeader>
            <ScrollView style={{width: Dimensions.get('window').width}} contentContainerStyle={{alignItems: 'center'}}>
                {
                    this.state.isActivity ? (
                  <View style={{width: width, alignItems: 'center'}}>
                      {
                          this.props.props.balanceData[this.props.props.args.name].transactions.length == 0 ? (
                              <View style={{textAlign: 'center', padding: 20}}>
                                <Text center color="grey">No Transactions</Text>
                                <Text center color="grey">Go to the RECEIVE page to get your wallet address</Text>
                              </View>
                          ) : (
                            <View style={{width, alignItems: 'center'}}>
                                {
                                    this.props.props.balanceData[this.props.props.args.name].transactions.map((item, index) => (
                                      <TouchableOpacity onPress={() => this.expand(index)} style={[styles.transaction, {borderTopWidth: index == 0 ? 1 : 0.5, borderBottomWidth: index == txs.length - 1 ? 1 : 0.5, height: this.state.heightList[this.props.props.args.name].heightList[index]}]}>
                                        <View style={styles.txIconCard}>
                                          <Image style={styles.txIcon} source={item.direction == 'SENT' ? require('../../assets/sent.png') : require('../../assets/receive.png')}/>
                                        </View>
                                        {
                                            item.confirmations == 0 ? (
                                                <View style={styles.pending}>
                                                  <Text color="#e44c3c" bold>Pending ...</Text>
                                                </View>
                                            ) : (
                                                <View style={styles.time}>
                                                  <Text bold>{moment(item.timestamp * 1000).format("DD/MM/YYYY")}</Text>
                                                  <Text>{moment(item.timestamp * 1000).format('HH:mm')}</Text>
                                                </View>
                                            )
                                        }
                                        <View style={styles.txAmountWrapper}>
                                          <Text size={20}>{item.value.toFixed(4)}</Text>
                                          <Text size={10}>{this.props.props.args.name}</Text>
                                        </View>
                                        {
                                            this.state.heightList[this.props.props.args.name].heightList[index] == 65 ? null : (
                                              <View style={{width, alignItems: 'center'}}>
                                                <View style={{marginTop: 20, alignItems: 'flex-start'}}>
                                                  <TouchableOpacity onPress={() => {
                                                      Clipboard.setString(item.txid)
                                                      Alert.alert('Copied to clipboard')
                                                  }} style={{flexDirection: 'row'}}>
                                                      <Text size={width / 27} bold>Txid: </Text>
                                                      <Text size={width / 27}>{item.txid.slice(0, (item.to_from.length - 3))}...</Text>
                                                  </TouchableOpacity>
                                                  <TouchableOpacity onPress={() => {
                                                      Clipboard.setString(item.to_from)
                                                      Alert.alert('Copied to clipboard')
                                                  }} style={{flexDirection: 'row', marginTop: 7}}>
                                                    <Text size={width / 27} bold>{item.direction == 'SENT' ? 'To' : 'From'}: </Text>
                                                    <Text size={width / 27}>{item.to_from}</Text>
                                                  </TouchableOpacity>
                                                  <View style={{flexDirection: 'row', marginTop: 7}}>
                                                    <Text size={width / 27} bold>Confirmations: </Text>
                                                    <Text size={width / 27}>{item.confirmations} {'  '.repeat(item.to_from.length - 8)}</Text>
                                                  </View>
                                                </View>
                                              </View>
                                            )
                                        }
                                      </TouchableOpacity>
                                    ))
                                   }
                              </View>
                          )
                      }
                  </View>
                    ) : this.state.isReceive ? (
              <View style={{width, alignItems: 'center'}}>
                  <TouchableOpacity onPress={this.copyAddress}>
                    <Card justifyCenter width={width - 50} height={50} top={30}>
                      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <Text size={width / 30} center color="grey">{this.props.props.keys[`${this.props.props.args.name}address`]}</Text>
                        <Image style={styles.copyIcon} source={this.getCoinInfo().clipboard}/>
                      </View>
                    </Card>
                  </TouchableOpacity>
                  <Card justifyCenter width={width - 50} height={width - 50} top={30}>
                      {
                          Platform.OS == 'ios' ? (
                            <IOS_QR 
                              size={width - 80} 
                              value={this.props.props.keys[`${this.props.props.args.name}address`]}
                              foregroundColor='black'
                              backgroundColor='#4d4c4c'
                          />
                          ) : (
                            <Android_QR 
                              value={this.props.props.keys[`${this.props.props.args.name}address`]}
                              bgColor='#4d4c4c'
                              size={width - 80}
                          />
                          )
                      }
                  </Card>
                  </View>
                    ) : this.state.isSend ? (
                        <View style={{width, alignItems: 'center'}}>
                            <Card style={{flexDirection: 'row'}} justifyCenter top={50} width={300} height={50}>
                              <TextInput placeholder='Address' placeholderTextColor="grey" style={styles.input} onChangeText={(address) => this.setState({address})} value={this.state.address}/>
                              <TouchableOpacity onPress={() => this.setState({qrModal: true})} style={{position: 'absolute', right: 15}}>
                                <Image style={styles.qr} source={this.getCoinInfo().qr}/>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={async () => this.setState({address: await Clipboard.getString()})} style={{position: 'absolute', right: 50}}>
                                <Image style={styles.qr} source={this.getCoinInfo().paste}/>
                              </TouchableOpacity>
                            </Card>
                            <Card style={{flexDirection: 'row'}} justifyCenter top={30} width={300} height={50}>
                              <TextInput keyboardType='numeric' placeholder='Amount' placeholderTextColor="grey" style={styles.input} onChangeText={(amount) => this.setState({amount: amount.replace(/,/, '.'), isMax: false})} value={this.state.amount}/>
                              <TouchableOpacity onPress={this.max} style={[{borderColor: this.getCoinInfo().color}, styles.sendAll]}>
                                  <Text bold size={10}>MAX</Text>
                              </TouchableOpacity>
                            </Card>
                            <View style={{flexDirection: 'row', marginTop: 25}}>
                                <TouchableOpacity onPress={() => this.changeFee('economy')} style={[styles.feeButton, {borderTopLeftRadius: 15, borderBottomLeftRadius: 15}]}>
                                    <Text size={12} color={this.state.feeButtons.left}>Economy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeFee('standard')} style={[styles.feeButton]}>
                                    <Text size={12} color={this.state.feeButtons.middle}>Standard</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.changeFee('fast')} style={[styles.feeButton, {borderTopRightRadius: 15, borderBottomRightRadius: 15}]}>
                                    <Text size={12} color={this.state.feeButtons.right}>Fast</Text>
                                </TouchableOpacity>
                            </View>
                            <Text top={20} color="grey">Fee: {this.state.fee}</Text>
                    <GradientButton onPress={() => this.setState({passwordModal: true})} title="SEND" top={30} color={this.getCoinInfo().color}/>
                    {/*<TextInput multiline style={{borderColor: 'white', borderWidth: 2, width: 200, height: 200, color: 'white'}} value={this.state.errorIndex}/>*/}
                        <Modal style={styles.modal} isVisible={this.state.qrModal} onBackdropPress={() => this.setState({qrModal: false})}>
                            <Card width={1} height={1}>
                              <View style={{width: '100%', height: '100%', alignItems: 'center'}}>
                                <QRCodeScanner
                                   cameraStyle={{height: height / 1.7}}
                                   onRead={this.onQrCodeScan}/>
                              </View>
                            </Card>
                        </Modal>
                      </View>
                    ) : null
                }
              </ScrollView>
            </KeyboardAvoidingView>
            <Modal animationIn='fadeIn' animationOut='fadeOut' isVisible={this.state.sucessModal} style={styles.successModal} onBackdropPress={() => this.setState({sucessModal: false})}>
                <Card height={180} width={150} justifyCenter>
                    <Image style={{width: 80, height: 80}} source={require('../../assets/success.png')}/>
                    <Text bold top={20}>SUCCESS</Text>
                </Card>
            </Modal>
            <Modal isVisible={this.state.passwordModal} style={styles.passwordModal} onBackdropPress={() => this.setState({passwordModal: false})} >
                <Card justifyCenter width={width - 100} height={200}>
                    <Text bold>ENTER PASSWORD</Text>
                    <TextInput secureTextEntry onChangeText={(value) => this.setState({password: value})} value={this.state.password} style={styles.passwordInput}/>
                    <GradientButton onPress={this.send} width={width - 200} height={40} top={25} title="SEND"/>
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
    },
    deleteTouchable: {
        width: 277,
        height: 87,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toggle: {
        position: 'absolute',
        bottom: 20
    },
    copyIcon: {
        width: 20,
        height: 20,
        marginLeft: 10
    },
    createWrapper: {
        bottom: Platform.OS == 'ios' ? 30 : 50,
        right: 20,
        position: 'absolute',
    },
    transaction: {
        width: Dimensions.get('window').width - 10,
        borderColor: 'grey',
        borderBottomWidth: 0.5,
        borderTopWidth: 0.5,
    },
    txIcon: {
        width: 35,
        height: 35
      },
    time: {
        marginLeft: 100,
        marginTop: 10
      },
      pending: {
          marginLeft: 100,
          height: 65,
          justifyContent: 'center'
      },
      txAmountWrapper: {
        position: 'absolute',
        right: 20,
        marginTop: 10,
        alignItems: 'flex-end',
      },
      txIconCard: {
        position: 'absolute',
        left: 20,
        marginTop: 13,
        justifyContent: 'center',
      },
      logo: {
        width: 150,
        height: 150,
        position: 'absolute',
        right: 0
    },
    qr: {
        width: 25,
        height: 25,
    },
    input: {
        height: 35,
        width: 200,
        marginLeft: -80,
        color: 'white'
    },
    sendAll: {
        width:  70,
        height: 25,
        borderRadius: 20,
        borderWidth: 2,
        position: 'absolute',
        right: 13,
        alignItems: 'center',
        justifyContent: 'center'
    },
    feeButton: {
        width: width / 4.5,
        height: 35,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#363636'
    },
    modal: {
        flex: 1,
        alignItems: 'center',
      },
    successModal: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    passwordModal: {
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    passwordInput: {
        borderWidth: 2,
        borderColor: 'white',
        width: width - 200,
        height: 40,
        textAlign: 'center',
        borderRadius: 5,
        marginTop: 15,
        color: 'white'
    }
});