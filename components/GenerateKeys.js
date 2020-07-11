import '../shim'
var lib = require('plusbit-js')
var bigi = require('bigi')

export default function(hash){
    var d = bigi.fromBuffer(hash + 'bylibtech')
    var l = bigi.fromBuffer(hash + 'libbyib')
    var z = bigi.fromBuffer(hash + 'btcz')
    var BitcoinKeyPair = new lib.ECPair(d, null, {network: lib.networks.bitcoin});
    var LICcoinKeyPair = new lib.ECPair(l, null, {network: lib.networks.bitcoin})
    var ZcashKeyPair = new lib.ECPair(d, null, {network: lib.networks.zcash}) // used for zelcash
    var DashKeyPair = new lib.ECPair(d, null, {network: lib.networks.dash})
    var BitcoinZKeyPair = new lib.ECPair(z, null, {network: lib.networks.zcash})
    return {
        BTCaddress: BitcoinKeyPair.getAddress(),
        BTCprivatekey: BitcoinKeyPair.toWIF(),
        ILCaddress: LICcoinKeyPair.getAddress(),
        ILCprivatekey: LICcoinKeyPair.toWIF(),
        ZELaddress: ZcashKeyPair.getAddress(),
        ZELprivatekey: ZcashKeyPair.toWIF(),
        DASHaddress: DashKeyPair.getAddress(),
        DASHprivatekey: DashKeyPair.toWIF(),
        BTCZaddress: BitcoinZKeyPair.getAddress(),
        BTCZprivatekey: BitcoinZKeyPair.toWIF()
    }
}