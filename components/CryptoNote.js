import '../shim'
import currencyFormatter from 'currency-formatter';
import RNSecureKeyStore, {ACCESSIBLE} from "react-native-secure-key-store";
import { Daemon, WalletBackend } from 'turtlecoin-wallet-backend';

// set defaults
var daemon = null;
var globalWallet = null;

// set config
var PGO_CONFIG = {
    host: '45.76.43.226',
    port: 17898,
    networkConfig: {
        addressPrefix: 13093182469,
    }
}



function returnNonActiveStatus(nodeStatus, price, unit) {
    return {
        price: currencyFormatter.format(price, { code: unit }),
        balance: '0.00000000',
        lockedBalance: '0.00000000',
        fiatBalance: '0.00',
        fiatRaw: 0,
        transactions: [],
        heightList: [],
        status: nodeStatus
    }
}

function getCryptoNoteAmount(arr){
    var bal = 0
    for (var i = 0; i < arr.length; i++){
        bal = bal + arr[i].amount
        if (i == arr.length - 1){
            return bal / 100000000
        }
    }
  }

  export function CreateCryptoNoteWallet (name, password, keys, syncHeight, callback) {
      // init daemon
      try {
          daemon = new Daemon(PGO_CONFIG.host, PGO_CONFIG.port, false, false)
          var [wallet, err] = WalletBackend.importWalletFromKeys(daemon, syncHeight, keys.viewprivatekey, keys.spendprivatekey, PGO_CONFIG.networkConfig);
          globalWallet = wallet;
          var [unlockedBalance, lockedBalance] = wallet.getBalance();
          var txs = new Arary;
          for (var tx of wallet.getTransactions(0, 100000000, false, undefined)) {
              txs.push({
                  txid: tx.hash,
                  value: WalletBackend.prettyPrintAmount(tx.totalAmount()),
                  timestamp: tx.timestamp,
                  direction: ''
              })
            console.log(`Transaction ${tx.hash} - ${WB.prettyPrintAmount(tx.totalAmount())} - ${tx.timestamp}`);
       }
        } catch (err) {
            callback(false)
        }
  }



  export function FormatBalances (x, name, password, unit, activeCoins, callback) {
      // check for PGO
      if (activeCoins.indexOf('PGO') == -1) {
          x.PGO = returnNonActiveStatus(1)
          callback(x)
      } else {

        x.PGO = returnNonActiveStatus(2)
        callback(x)

        RNSecureKeyStore.get("PGOwalletdata").then((res) => {
            
          }).catch((err) => {
              x.PGO = returnNonActiveStatus(1)
              callback(x)
          })
      }
  }



  

/*export default function (x, name, password, unit, pgoAddress, callback) {

    var PGO_RESPONSE = {}

    fetch(`http://45.76.43.226:8979/wallet/open`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json', "X-API-KEY" : 'pengolincoinpassword' },
        body: JSON.stringify({
            daemonHost: "127.0.0.1",
            daemonPost: 11898,
            filename: `${name}.wallet`,
            password: password
        })
    }).then((response) => {
        if (response.status !== 200) {
            closepengolinConnection()
            console.log(response.status)
            x.PGO = returnNonActiveStatus(1, x.PGO.price, unit)
            callback(x)
        } else {
            // get balance
            fetch( `http://45.76.43.226:8979/balance/${pgoAddress}`, {
                method: 'get',
                headers: { 'Content-Type': 'application/json', "X-API-KEY" : "pengolincoinpassword" },
            }).then(balRes => balRes.json()).then(balJson => {
                PGO_RESPONSE.price = currencyFormatter.format(x.PGO.price, { code: unit });
                PGO_RESPONSE.balance = parseFloat(balJson.unlocked / 100000000).toFixed(8);
                PGO_RESPONSE.fiatRaw = Number(balJson.unlocked / 100000000 * x.PGO.price);
                PGO_RESPONSE.fiatBalance = currencyFormatter.format((balJson.unlocked /  100000000) * x.PGO.price, { code: unit });
                fetch( `http://45.76.43.226:8979/transactions/address/${pgoAddress}/0/1000000000`, {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json', "X-API-KEY" : "pengolincoinpassword" },
                }).then(txRes => txRes.json()).then(txJson => {
                    let formatted = new Array;
                    var heightList = new Array;
                    txJson.transactions.forEach(tx => {
                        formatted.push({
                            txid: tx.hash,
                            direction: tx.transfers[0].address == pgoAddress ? 'RECEIVED' : 'SENT',
                            value: getCryptoNoteAmount(tx.transfers),
                            timestamp: tx.timestamp
                        })
                        heightList.push(65)
                    })
                    PGO_RESPONSE.transactions = formatted;
                    PGO_RESPONSE.heightList = heightList;
                    PGO_RESPONSE.status = 1;
                    total = currencyFormatter.unformat(x.totalBalance, { code: unit }) + PGO_RESPONSE.fiatRaw;
                    x.totalBalance = currencyFormatter.format(total, { code: unit })
                    x.PGO = PGO_RESPONSE;
                    console.log(x)
                    callback(x);
                    closepengolinConnection()
                }).catch((txError) => {
                    x.PGO = returnNonActiveStatus(2, x.PGO.price, unit)
                    callback(x)
                })
            }).catch((balError) => {
                x.PGO = returnNonActiveStatus(2, x.PGO.price, unit)
                callback(x)
            })
        }
    }).catch((error) => {
        x.PGO = returnNonActiveStatus(2, x.PGO.price, unit)
        callback(x)
    })
}

function closepengolinConnection(){
    fetch('http://45.76.43.226:8979/wallet', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json', "X-API-KEY": "pengolincoinpassword" },
  })
}*/