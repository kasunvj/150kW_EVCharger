const canbus = require('../nodecan.json');
const can = require('socketcan');
const channel = can.createRawChannel('can0', true);

count = 0;

var message = {
    id: 0x123, // CAN ID
    data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
    ext: true, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
    timestamp: Date.now() // Optional: current timestamp
  };

class CanModule{
    constructor(){
        this.posts = [];
        this.start();
    }

    start(){
        /*
        start the channel and start listening
        */
        channel.start();
        console.log('CAN channel started.');
        channel.addListener('onMessage', (msg) => {
              //console.log('Message received:', msg);
              count++;
              //this.decode(msg);
            });
        }
    
    stop(){
        /*
        stops the channel
        */
        channel.stop();
        console.log('CAN channel stopped.');
        } 

    send(src,des,cmdtype,canerr,cancmd,candata){
        /*
        srcaddr: 'String' Source address. 
        */
       console.log(`${src.toString(2)}`);
       console.log(`${dest.toString(2)}`);
       console.log(`${cmdtype.toString(2)}`);
       console.log(`${canerr.toString(2)}`);
       console.log(`${cancmd.toString(2)}`);
        //message.id = '0x'+ this.assembleID(src,des,cmdtype,canerr,cancmd).toString('hex');
        //message.data = this.assembleData(candata);
        
        //channel.send(message);
        //console.log('Message sent:', message);
        }


  }

module.exports = { CanModule };