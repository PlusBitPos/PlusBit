import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import Settings from './utilPages/Settings'
import Wallet from './utilPages/Wallet'
import GestureRecognizer from '../components/GestureHandler';


export default class Util extends Component {

    constructor(){
        super()
        this.state = {
            imageOpacity: new Animated.Value(0),
            refresh: false
        }
    }

    goBack = () => {
        this.setState({refresh: true})
        setTimeout(() => {
            this.setState({refresh: false})
        }, 100)

    }

  render() {
    return (
        <GestureRecognizer config={{velocityThreshold: 1, directionalOffsetThreshold: 80}} onSwipeRight={() => {
          this.props.utilToDashboard()
          if (this.props.page == 'wallet'){
            this.refs.wallet.disMount()
          }
          }}>
            {
              this.props.page == 'settings' ? (
                <Settings props={this.props}/>
              ) : this.props.page == 'wallet' ? (
                <Wallet password={this.props.password} ref="wallet" props={this.props}/>
              ) : null
            }
         </GestureRecognizer>
    )
  }
};

const styles = StyleSheet.create({
    background: {
        backgroundColor: '#222222',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
});