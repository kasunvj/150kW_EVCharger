/*
CAN Message Decode
    CAN ID:
    _____|Typ Err Cmd Sou Des 
    bits  2   3   8   8   8
    
    CAN Data:
    _____|Data 
    bytes 8
     
CAN Data interpretation 
 *                          
 *      command -command type - data field representation
 * 
 *              0 - 'req' - null
 *              0 - 'res' - null
 * 
 *              1 - 'req' - (0-1) 1 byte  Action
 *                          (1-2) 1 byte  Contactor 
 *                          (2-3) 1 byte  PC State 
 *                          (3-4) 1 byte  Cable Temp
 *                          (4-6) 2 bytes Request Voltage
 *                          (6-8) 2 bytes Request Current
 * 
 *              1 - 'res' - (0-1) 1 byte  FB Action
 *                          (1-2) 1 byte  FB Contactor 
 *                          (2-3) 1 byte  CC State 
 *                          (3-4) 1 byte  null
 *                          (4-6) 2 bytes Bus Voltage
 *                          (6-8) 2 bytes Bus Current
 * 
 *              2 - 'req' - null
 *              
 *              2 - 'res' - (0-4) 4 bytes Max power
 *                          (4-6) 2 bytes Max voltage
 *                          (6-8) 2 bytes Max current
 * 
 *              3 - 'req' - (0-1) 1 byte Charging state
 *                          (1-2) 1 byte NC State
 * 
 *              3 - 'res' - (0-1) 1 byte  Charging State
 *                          (1-2) 1 byte  Error Code
 *                          (2-3) 1 byte  Flags
 *                          (3-4) 1 byte  SOC
 *                          (4-6) 2 bytes Instantanoius Voltage
 *                          (6-8) 2 bytes Instantanoius Current
 * 
 *              4 - 'req' - null
 * 
 *              4 - 'res' - (0-4) 4 bytes Accumilated Energy
 *                          (4-8) 4 bytes Instantanoius Power
 * 
 *              5 - 'req' - (0-1) 1 byte CC State 
 *                          (1-3) 2 bytes Cabinet Power Out
 *                          (3-5) null
 *                          (5-6) 1 byte Max Temp
 *                          (6-7) 1 byte Min Temp
 *                          (7-8) 1 byte Avg Temp
 * 
 *              5 - 'res' - (6-7) 1 byte Coolant Temp 
 * 
 *              6 - 'req' - (0-1) 1 byte Error code 1  
 *                          (2-3) 1 byte Error code 2 
 *                          (3-4) 1 byte Error code 3 
 *                          (2-5) 1 byte Error code 4 
  
 *              6 - 'res' - null'
 * 
 *              7 - 'req' - (4-8) 4 bytes Max power limit
 * 
 *              7 - 'res' - (0-2) 2 bytes Default power
 *                          (2-4) 2 bytes Phase AB voltage
 *                          (4-6) 2 bytes Phase BC Voltage
 *                          (6-8) 2 bytes Pase CA voltage
 
 *              8 - 'req' - null
 *              8 - 'res' - null
 * */


const can = require('socketcan');
const channel = can.createRawChannel('can0', true);

const canCmdTyp = {
    'req' :    0b0,
    'res' :    0b1}
    
const canErr = {
    'normal':   0b000,
    'okay'  :   0b001,
    'busy'  :   0b010,
    'invalcmd': 0b011,
    'invaldat': 0b100}
    
const canCmd = {
    0   : 0x00,
    1   : 0x01,
    2   : 0x02,
    3   : 0x03,
    4   : 0x04,
    5   : 0x05,
    6   : 0x06,
    7   : 0x07,
    8   : 0x08}
    
const board = {
    'pc': 0b000,
    'cc': 0b001,
    'nc': 0b010,
    'tmc':0b011,
    'esc':0b100,
    'brd':0b111
    }
    
const PCState  = {
    'normal': 0x03,
    'estop' : 0x05,
    'ota'   : 0x07
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
        this.netcontrollers = [];
        this.portcontrollers = [];
        this.cabinetcontrollers = [];
        this.themalcontrollers = [];
        this.envcontrollers = [];
        this.start();
        }
        
    /*Basic fucntions that can access from base program*/
    send(cmdtype,canerr,cancmd,srcaddr,desaddr){
        //channel.send(Buffer.concat([this.assembleID(),this.assembleData()]));
        channel.send(message);
        console.log('Message sent:', message);
        }
        
        
    createMachines(ncCount,pcCount,ccCount,tmcCount,ecCount){
        
        for (let i = 0; i < ncCount; i++) {
            let obj = {
                id: i + 1,
                name: `Object${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.netcontrollers.push(obj);
        }
        
        for (let i = 0; i < pcCount; i++) {
            let obj = {
                id: i + 1,
                name: `Object${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.portcontrollers.push(obj);
        }
        
        for (let i = 0; i < ccCount; i++) {
            let obj = {
                id: i + 1,
                name: `Object${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.cabinetcontrollers.push(obj);
        }
        
        for (let i = 0; i < tmcCount; i++) {
            let obj = {
                id: i + 1,
                name: `Object${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.themalcontrollers.push(obj);
        }
        
        for (let i = 0; i < ecCount; i++) {
            let obj = {
                id: i + 1,
                name: `Object${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.envcontrollers.push(obj);
        }
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
