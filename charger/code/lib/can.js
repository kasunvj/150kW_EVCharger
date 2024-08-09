/*
CAN Message Decode
    CAN ID:
    **** Typ Err Cmd Sou Des 
    bits 2   3   8   8   8
*/

const can = require('socketcan');
const channel = can.createRawChannel('can0', true);

const canCmdTyp = {
    'a' :    '0b0',
    'b' :    '0b1'
    }
const canErr = {
    'normal':   '0b000',
    'okay'  :   '0b001',
    'busy'  :   '0b010',
    'invalcmd': '0b011',
    'invaldat': '0b100'
    }
const canCmd = {
    0   : '0x00',
    1   : '0x01',
    2   : '0x02',
    3   : '0x03',
    4   : '0x04',
    5   : '0x05',
    6   : '0x06',
    7   : '0x07',
    8   : '0x08',
    }


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
        //channel.send(Buffer.concat([this.assembleID(),this.assembleData()]));
        channel.send(message);
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
        buf = Buffer.from([0x01,0x02,0x03,0x04]);
        return buf;
        }
    
    
    assembleData(){
        var buf = Buffer.alloc(4)
        buf = Buffer.from([0x05,0x06,0x07,0x08]);
        return buf;
        }
        
    print(msg){
        console.log(msg,canCmd['c']);
        }
    
}

    

module.exports = { CAN };
