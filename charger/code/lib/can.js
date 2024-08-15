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


const { cpSync } = require('fs');
const can = require('socketcan');
const channel = can.createRawChannel('can0', true);

const canCmdTyp = {
    'req' :    0b00,
    'res' :    0b01}
    
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
    'pc_': 0b000,
    'cc_': 0b001,
    'nc_': 0b010,
    'tmc':0b011,
    'esc':0b100,
    'brd':0b111
    }
    
const PCState  = {
    'normal': 0x03,
    'estop' : 0x05,
    'ota'   : 0x07
    }
    

const sysInfo = {
    post : 0b01,
    nboard : 0b001,
    }

const protocolInfo = {
    post_bits: 2,
    nboard_bits:3,
    iderrorcode_bits:3,
    idcommand_bits:8,
    idsrcadd_bits:8,
    iddestadd_bits : 8
    }

class ControllerID{
    constructor(){
        this.board = '';
        this.post ='';
        this.boardNo = '';
        this.name = '';
        }
    }



var message = {
  id: 0x123, // CAN ID
  data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
  ext: true, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
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
    send(srcaddr,desaddr,cmdtype,canerr,cancmd,candata){
        
        //message.id =this.assembleID(srcaddr,desaddr,cmdtype,canerr,cancmd);
        message.id = '0x'+ this.assembleID(srcaddr,desaddr,cmdtype,canerr,cancmd).toString('hex');
        message.data = this.assembleData(candata);
        
        channel.send(message);
        console.log('Message sent:', message);
        }
    
    walk(){
        //this.send('nc','brd','req','normal',0,0);
        this.send('pc_','nc_','res','normal',0,0);

    }
    
    
    start(){
        channel.start();
        console.log('CAN channel started.');
        channel.addListener('onMessage', (msg) => {
              //console.log('Message received:', msg);
              this.decode(msg);
            });
        }
        
    stop(){
        channel.stop();
        console.log('CAN channel stopped.');
        } 
        
    /*Internal Functions*/
    assembleID(src,des,cmdtype,canerr,cancmd){
        const source = ((board[src] << protocolInfo.post_bits | sysInfo.post ) << protocolInfo.nboard_bits) | sysInfo.nboard;
        const destination = ((board[des] << protocolInfo.post_bits | sysInfo.post ) << protocolInfo.nboard_bits) | sysInfo.nboard;
        const cmdtypeAndErr = canCmdTyp[cmdtype] << protocolInfo.iderrorcode_bits | canErr[canerr];
        
        console.log()
        
        var buf = Buffer.from([cmdtypeAndErr,canCmd[cancmd],source,destination]);
        console.log("Buffer: ",buf);
        return buf;
        }

    assembleData(option){
        var buf = Buffer.alloc(4)
        buf = Buffer.from([0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07]);
        return buf;
        }
    
    decode(msg){

        var inIdBuf = Buffer.alloc(4);
        inIdBuf = Buffer.from(msg.id.toString(16).padStart(8,'0'),'hex');
        const inDataBuf = msg.data;

        const cmdType = inIdBuf[0].toString(2).padStart(8,'0').slice(3,5);
        const errCode = inIdBuf[0].toString(2).padStart(8,'0').slice(5,8);
        const command = inIdBuf[1];
        var sourceID = new ControllerID();
        var destinationID = new ControllerID();
        sourceID.board = inIdBuf[2].toString(2).padStart(8,'0').slice(0,3);
        sourceID.post = inIdBuf[2].toString(2).padStart(8,'0').slice(3,5);
        sourceID.boardNo = inIdBuf[2].toString(2).padStart(8,'0').slice(5,8);
        sourceID.name = this.getControlleName(sourceID.board);
        destinationID.board = inIdBuf[3].toString(2).padStart(8,'0').slice(0,3);
        destinationID.post = inIdBuf[3].toString(2).padStart(8,'0').slice(3,5);
        destinationID.boardNo = inIdBuf[3].toString(2).padStart(8,'0').slice(5,8);
        destinationID.name = this.getControlleName(destinationID.board);

        console.log(`src:\x1b[96m${sourceID.name} ${sourceID.post} ${sourceID.boardNo} \x1b[00m` +
                            `des:\x1b[96m${destinationID.name} ${destinationID.post} ${destinationID.boardNo} \x1b[00m` +
                            `type:\x1b[96m${cmdType}\x1b[00m err:\x1b[96m${errCode}\x1b[00m ` +
                            `cmd:\x1b[96m${command}\x1b[00m `+
                            `data:\x1b[96m${inDataBuf.toString('hex').match(/.{1,2}/g).join(' ').toUpperCase()}\x1b[00m`);

        switch(command){
            case 0x00 :
                console.log("updating chargers");
                this.updateDeviceTable(sourceID);
                break;
            case 0x01 :
                console.log("command 1");
                break;
            default :
                console.log("defalut command");
                break;

        }
        
    }
    
    createMachines(ncCount,pcCount,ccCount,tmcCount,ecCount){
    
        for (let i = 0; i < ncCount; i++) {
            let obj = {
                id: i + 1,
                name: `Network Controller ${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.netcontrollers.push(obj);
        }
        
        for (let i = 0; i < pcCount; i++) {
            let obj = {
                id: i + 1,
                name: `Port Controller ${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.portcontrollers.push(obj);
        }
        
        for (let i = 0; i < ccCount; i++) {
            let obj = {
                id: i + 1,
                name: `Cabin Controller ${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.cabinetcontrollers.push(obj); 
        }
        
        for (let i = 0; i < tmcCount; i++) {
            let obj = {
                id: i + 1,
                name: `Thermal Controller ${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.themalcontrollers.push(obj);
        }
        
        for (let i = 0; i < ecCount; i++) {
            let obj = {
                id: i + 1,
                name: `Environment Controller ${i + 1}`,
                timestamp: new Date().toISOString()
            };

            this.envcontrollers.push(obj);
        }
    }
     
    getControlleName(board){
        switch(board){
            case '000': return "pc_";
            case '001': return "cc_";
            case '010': return "nc_";
            case '011': return "tmc";
            case '100': return "esv";
            case '111': return "brd";
        }
    
    }

    updateDeviceTable(sourceID){
        switch(sourceID.name){
            case "pc_":
                console.log("Updating port controller");
                let obj = {
                    count: this.portcontrollers.length + 1,
                    name: sourceID.name,
                    board: sourceID.boardNo,
                    post: sourceID.post,
                    boardNo: sourceID.boardNo,
                    timestamp: new Date().toISOString()
                };
                console.log(obj);
                this.portcontrollers.push(obj);
                break;
            default:
                console.log("source can not recognize :",sourceID.name);
                break;
        }
    }
        
    print(msg){
        console.log(msg,canCmd['c']);
        }
    
}

    

module.exports = { CAN };
