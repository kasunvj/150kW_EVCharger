const can = require('socketcan');
const channel = can.createRawChannel('can0', true);




const canCmd = {
    'a': '0b0',
    'b': '0b1'}



const canErrorNormal = '0b000';
const canErrorOkey   = '0b001';


const message = {
  id: 0x123, // CAN ID
  data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
  ext: false, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
  timestamp: Date.now() // Optional: current timestamp
};

class CAN{
    constructor(){
        this.a = 0;
        this.start();
        }
        
    /*Basic fucntions */
    send(){
        const identifier = this.assembleID();
        const data = this.assembleData();
        channel.send(Buffer.concat([identifier,data]));
        console.log('Message sent:', message);
        }
    
    
    
    start(){
        channel.start();
        console.log('CAN channel started.');
        channel.addListener('onMessage', (msg) => {
              console.log('Message received:', msg);
            });
        }
        
    stop(){
        channel.stop();
        console.log('CAN channel stopped.');
        } 
        
    /*Internal Functions*/
    assembleID(){
        var buf = Buffer.alloc(4);
        
        return buf;
        }
    
    /*
    assembleData(){
        var buf = Buffer.alloc()
        
        return buf;
        }*/
    print(msg){
        console.log(msg,canCmd['c']);
        }
    
}

    

module.exports = { CAN };
