const nodecan = require('../nodecan.json');
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
              this.decode(msg);
            });
        }
    
    stop(){
        /*
        stops the channel
        */
        channel.stop();
        console.log('CAN channel stopped.');
        } 

    send(src,dest,type,errorcode,command,candata){
        /*
        srcaddr: 'String' Source address. 
        */
       console.log(`${src.toString(2).padStart(nodecan.protocol.bits.src,"0")}`);
       console.log(`${dest.toString(2).padStart(nodecan.protocol.bits.dest,"0")}`);
       console.log(`${type.toString(2).padStart(nodecan.protocol.bits.type,"0")}`);
       console.log(`${errorcode.toString(2).padStart(nodecan.protocol.bits.errorcode,"0")}`);
       console.log(`${command.toString(2).padStart(nodecan.protocol.bits.command,"0")}`);
        //message.id = '0x'+ this.assembleID(src,des,cmdtype,canerr,cancmd).toString('hex');
        //message.data = this.assembleData(candata);
        
        //channel.send(message);
        //console.log('Message sent:', message);
        }
    
    //encodeId(src,dest,type,errorcode,command){
    //   const srcBitAssembly = src.toString(2).padStart(nodecan.protocol.bits.src,"0")
    //}

    decode(msg){
        /*
        identifire - 29 bits (4 bytes)
        data - 8 bytes
        */
        var id = Buffer.alloc(4);
        id = Buffer.from(msg.id.toString(16).padStart(8,'0'),'hex');
        console.log("In buffer:",id);

        const type = id[nodecan.type.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.type.bitlocation.start,nodecan.type.bitlocation.end);
        const error = id[nodecan.error.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.error.bitlocation.start,nodecan.type.bitlocation.end);
        const command = id[nodecan.command.bytelocation];

        console.log("type",type);
        console.log("error",error);
        console.log("command",command);
    }



  }

module.exports = { CanModule };