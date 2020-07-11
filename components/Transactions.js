import { Alert } from 'react-native'
import coinSelect from 'coinselect'
import lib from 'plusbit-js'
import axios from 'axios'

function getCoinData(sym, bls){
    if (sym == 'BTC'){
        return {
            balance: Number(bls.BTC.balance),
            explorer: 'https://insight.bitpay.com',
            network: lib.networks.bitcoin
        }
    } else if (sym == 'ILC'){
        return {
            balance: Number(bls.ILC.balance),
            explorer: 'https://ilcoinexplorer.com',
            network: lib.networks.bitcoin
        }
    } else if (sym == 'ZEL'){
        return {
            balance: Number(bls.ZEL.balance),
            explorer: 'https://explorer.zel.cash',
            network: lib.networks.zcash
        }
    } else if (sym == 'DASH'){
      return {
          balance: Number(bls.DASH.balance),
          explorer: 'https://insight.dash.org',
          network: lib.networks.dash
      }
    } else if (sym == 'BTCZ'){
      return {
          balance: Number(bls.BTCZ.balance),
          explorer: 'https://explorer.btcz.rocks',
          network: lib.networks.zcash
      }
    }
}

export default function(params, cb){
  if (params.coin == 'PGO'){
    cb({status:2, message: 'Error sending transaction'})
  } else {
  if (params.to == '' || params.amount <= params.fee) { cb({status: 2, message: 'Enter an address and amount greater than transaction fee'}) } else {}
    var coinData = getCoinData(params.coin, params.bls)
    if (coinData.balance < Number((params.amount + params.fee).toFixed(8))) { (cb({status: 2, message: 'Not enough funds'})) } else {
      checkAddress(params, coinData, cb)
    }
  }
}

function checkAddress(params, coinData, cb){
  try {
    lib.address.toOutputScript(params.to, coinData.network)
    getUtxos(params, coinData, cb)
  } catch {
    cb({status: 2, message: 'Invalid address'})
  }
}

function getUtxos(params, coinData, cb){
  axios.get(`${coinData.explorer}/api/addr/${params.from}/utxo`).then(function(result){
    processUtxos(params, coinData, result.data, cb)
  }).catch(function() {
    cb({status: 2, message: 'Connection error. Check your internet connectivity and try again'})
  })
}

function processUtxos(params, coinData, utxos, cb){
  params.totalSats = (params.amount * 100000000) + (params.fee * 100000000)
  params.round = Number(params.totalSats.toFixed(0))
  var targets = [{ address: 'moKyssgHDXPfgW7AmUgQADrhtYnJLWuTGu', satoshis: params.round }]
  var feeRate = 0;
  var { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate);
  if (inputs == undefined){
    let available = 0
    for (var i = 0; i < utxos.length; i++){
      available = available + utxos[i].amount
    }
    cb({status: 2, message: `Insufficient available funds. You have ${available.toFixed(8)} ${params.coin} available. This may be caused my unconfirmed transactions.` +
   ' If you have any unconfirmed transactions wait until they have at least 1 confirmation and try again'})
  } else {
    buildTransaction(params, coinData, inputs, cb)
  }
}

function buildTransaction(params, coinData, inputs, cb){
  try {
    // init build process
    var builder = new lib.TransactionBuilder(coinData.network);
    // add coin specific paramiters
    if (params.coin == "ZEL" || params.coin == 'BTCZ'){
      builder.setVersion(lib.Transaction.ZCASH_SAPLING_VERSION);
      builder.setVersionGroupId(parseInt('0x892F2085', 16));
      axios.get(`${coinData.explorer}/api/status`).then(function (status) {
        builder.setExpiryHeight(status.data.info.blocks + 100);
      })
    }
    // calculate change
    let values = new Array
    for (var i = 0; i < inputs.length; i++){
      values.push(inputs[i].satoshis)
    }
    params.sum = values.reduce((a, b) => a + b)
    var changeAm = params.sum - params.round;
    console.log(`sent: ${Number((params.amount * 100000000).toFixed(0))} change: ${changeAm} fee: ${params.sum - (Number((params.amount * 100000000).toFixed(0)) + changeAm)}`)
    // add tx inputs
    inputs.forEach(input => builder.addInput(input.txid, input.vout))
    // add outputs
    builder.addOutput(params.to.replace(/\s+/g, ''), Number(((params.amount * 100000000)).toFixed(0)))
    if (!(params.round == coinData.balance * 100000000)){
      builder.addOutput(params.from, changeAm)
    }
    signTransaction(params, coinData, inputs, builder, cb)
  } catch {
    cb({status: 2, message: 'Problem building transaction. Please try again'})
  }
}

function signTransaction(params, coinData, inputs, builder, cb){
  try {
    var key = lib.ECPair.fromWIF(params.priv, coinData.network);
    // applying signature
    if (params.coin == "ZEL" || params.coin == 'BTCZ'){
      inputs.forEach((v, i) => {builder.sign(i, key, '', lib.Transaction.SIGHASH_SINGLE, inputs[i].satoshis)})
    } else {
      inputs.forEach((v, i) => {builder.sign(i, key)})
    }
    broadcastTransaction(coinData, builder.build().toHex(), cb)
  } catch (err) {
    console.log(err)
    cb({status: 2, message: 'Problem signing transaction. Please try again'})
  }
}

function broadcastTransaction(coinData, txhex, cb){
 axios.post(`${coinData.explorer}/api/tx/send`, {rawtx: txhex})
  .then(function (response) {
    cb({status: 1})
  })
  .catch(function (error) {
    console.log(error)
    cb({status: 2, message: 'problem broadcasting transaction, if you have just made a transaction that is currently unconfirmed please try again in a few minutes'})
  });
}