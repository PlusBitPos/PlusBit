import React, {Component} from 'react';
import { StyleSheet, View, Image, Dimensions, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'
import Text from './Text'
import DeviceInfo from 'react-native-device-info'
import Card from './Card'

export default class CoinCard extends Component {

  constructor(){
    super()
    this.state = {
    }
  }

  getLogo = (coin) => {
    if (coin == 'BTC'){
      return require('../assets/BTC.png')
    } else if (coin == 'ILC'){
      return require('../assets/ILC.png')
    } else if (coin == 'ZEL'){
      return require('../assets/ZEL.png')
    } else if (coin == 'DASH'){
      return require('../assets/DASH.png')
    } else if (coin == 'BTCZ'){
      return require('../assets/BTCZ.png')
    }
  }


  getCoinData = (coin) => {
    if (coin == 'BTC'){
      return {
        gradient: ['rgb(233, 122, 22)', 'rgb(247, 156, 74)'],
        name: 'BTC',
        balance: this.props.balance.BTC
      }
    } else if (coin == 'ILC'){
      return {
        gradient: ['rgb(19, 64, 115)', 'rgb(23, 142, 159)'],
        name: 'ILC',
        balance: this.props.balance.ILC
      }
    } else if (coin == 'ZEL'){
      return {
        gradient: ['rgb(64, 31, 122)', 'rgb(173, 36, 117)'],
        name: 'ZEL',
        balance: this.props.balance.ZEL
      }
    } else if (coin == 'DASH'){
      return {
        gradient: ['rgb(14, 119, 221)', '#61a3fa'],
        name: 'DASH',
        balance: this.props.balance.DASH
      }
    } else if (coin == 'BTCZ'){
      return {
        gradient: ['#fbc44c', '#ffd16b'],
        name: 'BTCZ',
        balance: this.props.balance.BTCZ
      }
    }
  }

  render() {
    return (
      <View style={styles.shadow}>
        <LinearGradient start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={this.getCoinData(this.props.coin).gradient} style={styles.card}>
          <Card top={DeviceInfo.hasNotch() == 1 ? 50 : 25} width={280} height={80} justifyCenter style={{alignItems: 'flex-start'}}>
            <Image style={styles.logo} source={this.getLogo(this.props.coin)}/>
            <View style={styles.balanceWrapper}>
              <Text bold>{this.getCoinData(this.props.coin).balance.balance} {this.props.coin}</Text>
              <Text size={12}>{this.getCoinData(this.props.coin).balance.fiatBalance}</Text>
            </View>
            <View style={styles.infoWrapper}>
              <Text bold>{this.getCoinData(this.props.coin).name}</Text>
              <Text size={12}>{this.getCoinData(this.props.coin).balance.price || 'Network Error'}</Text>
            </View>
          </Card>
            {this.props.children}
        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    height: DeviceInfo.hasNotch() == 1 ? 210 : 190, 
    width: Dimensions.get('window').width, 
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  shadow: {
    shadowColor: "#181818",
    shadowOffset: {
  	width: 7,
  	height: 7,
  },
  shadowOpacity: 1,
  shadowRadius: 7,

  elevation: 40,
  backgroundColor: 'black',
  },
  arrow: {
    width: 40,
    height: 40
  },
  arrowWrapper: {
    position: 'absolute',
    left: DeviceInfo.hasNotch() == 1 ? 20 : 10,
    top: DeviceInfo.hasNotch() == 1 ? 30 : 10,
  },
  logo: {
    width: 35, 
    height: 35,
    marginLeft: 10
  },
  balanceWrapper: {
    position: 'absolute',
    right: 10,
    alignItems: 'flex-end'
  },
  infoWrapper: {
    position: 'absolute',
    left: 55,
  }
})