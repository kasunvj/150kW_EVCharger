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
const { logger } = require('./log.js');
const channel = can.createRawChannel('can0', true);
const nodecan = require('../nodecan.json');

/*
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
*/

class ControllerID{
    constructor(){
        this.boardtype = '';
        this.postid ='';
        this.boardid = '';
        this.name = '';
        }
    }

class CCData{
    constructor(){
        this.defaultPower = 0;
        this.phaseABVoltage = 0;
        this.phaseBCVoltage = 0;
        this.phaseCAVoltage = 0;
    }
}

var count = 0;

var message = {
  id: 0x123, // CAN ID
  data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
  ext: true, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
  timestamp: Date.now() // Optional: current timestamp
};

class CAN{ 
    constructor(){
        this.a = 0;
        this.posts = [];
        this.start();
        }
    
    send(srcaddr,desaddr,cmdtype,canerr,cancmd,candata){
        
        message.id = '0x'+ this.assembleID(srcaddr,desaddr,cmdtype,canerr,cancmd).toString('hex');
        message.data = this.assembleData(candata);
        
        channel.send(message);
        //console.log('Message sent:', message);
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
              count++;
              this.decode(msg);
            });
        }
        
    stop(){
        channel.stop();
        console.log('CAN channel stopped.');
        } 
        
    /*Internal Functions*/
    assembleID(src,des,cmdtype,canerr,cancmd){
        const source = ((board[src] << nodecan.protocolInfo.post_nbits | nodecan.systemInfo.post ) << nodecan.protocolInfo.board_nbits) | nodecan.systemInfo.nboard;
        const destination = ((board[des] << protocolInfo.post_bits | sysInfo.post ) << protocolInfo.nboard_bits) | sysInfo.nboard;
        const cmdtypeAndErr = canCmdTyp[cmdtype] << protocolInfo.iderrorcode_bits | canErr[canerr];
        
        var buf = Buffer.from([cmdtypeAndErr,canCmd[cancmd],source,destination]);
        console.log("Out buffer: ",buf);
        return buf;
        }

    assembleData(buff){
        var buf = Buffer.alloc(8)
        buf = Buffer.from([0x0,0x0,0x0,0x0,0x0,0x00,0x00,0x37]);
        return buf;
        }
    
    decode(msg){
        var inIdBuf = Buffer.alloc(4);
        inIdBuf = Buffer.from(msg.id.toString(16).padStart(8,'0'),'hex');
        console.log("In buffer:",inIdBuf);

        const cmdType = inIdBuf[0].toString(2).padStart(8,'0').slice(3,5);
        const errCode = inIdBuf[0].toString(2).padStart(8,'0').slice(5,8);
        const command = inIdBuf[1];
       
        var sourceID = new ControllerID();
        var destinationID = new ControllerID();
        
        sourceID.boardtype = inIdBuf[2].toString(2).padStart(8,'0').slice(0,3);
        sourceID.postid = this.bin2dec(inIdBuf[2].toString(2).padStart(8,'0').slice(3,5));
        sourceID.boardid = this.bin2dec(inIdBuf[2].toString(2).padStart(8,'0').slice(5,8));
        sourceID.name = this.getControlleName(sourceID.boardtype);

        destinationID.boardtype = inIdBuf[3].toString(2).padStart(8,'0').slice(0,3);
        destinationID.postid = this.bin2dec(inIdBuf[3].toString(2).padStart(8,'0').slice(3,5));
        destinationID.boardid = this.bin2dec(inIdBuf[3].toString(2).padStart(8,'0').slice(5,8));
        destinationID.name = this.getControlleName(destinationID.boardtype);
    
        console.log(`${count} \x1b[96mSRC device:${sourceID.name} post:${sourceID.postid} board:${sourceID.boardid} \x1b[00m` +
                            `\x1b[95mDES device:${destinationID.name} post:${destinationID.postid} board:${destinationID.boardid} \x1b[00m` +
                            `type:\x1b[96m${cmdType}\x1b[00m err:\x1b[96m${errCode}\x1b[00m ` +
                            `cmd:\x1b[96m${command}\x1b[00m `+
                            `data:\x1b[96m${(msg.data).toString('hex').match(/.{1,2}/g).join(' ').toUpperCase()}\x1b[00m`);
        
        this.updateDeviceTable(sourceID);
        switch(command){
            case 0x00 :
                console.log("updating devices");
                break;
            case 0x01 :
                console.log("command 1");
                break;
            case 0x07:
                console.log("Message from Cabinet Controller");
                var obj = getDeviceObj(sourceID);
                this.decodeCommandSeven(obj);
                break;
            default :
                console.log("defalut command");
                break;

        }
        
    }

    getDeviceObj(sourceID){
        let obj;
        let boardindex;
        const postindex = this.posts.findIndex(item => item.postid === sourceID.postid);
        switch(sourceID.name){
            case "nc_":
                boardindex = this.posts[postindex].netcontrollers.find(item => item.boardid === sourceID.boardid);
            case "pc_":
                boardindex = this.posts[postindex].portcontrollers.find(item => item.boardid === sourceID.boardid);
            case "cc_":
                boardindex = this.posts[postindex].cabinetcontrollers.find(item => item.boardid === sourceID.boardid);
            case "tmc":
                boardindex = this.posts[postindex].themalcontrollers.find(item => item.boardid === sourceID.boardid);
            case "esv":
                boardindex = this.posts[postindex].envcontrollers.find(item => item.boardid === sourceID.boardid);
            default:
                boardindex = 999;
        }

        return 
    }
    /*
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
    }*/
     
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
        const result_post = this.posts.find(item => item.postid === sourceID.postid);

        if(result_post){
            console.log("Post exists");
        }else{
            console.log("Post creating");
            let obj = {
                postid : sourceID.postid,
                netcontrollers :[],
                portcontrollers :[],
                cabinetcontrollers :[],
                themalcontrollers :[],
                envcontrollers :[],
                //timestamp: new Date().toISOString()
            };
            this.posts.push(obj);
        }

        const postindex = this.posts.findIndex(item => item.postid === sourceID.postid);

        switch(sourceID.name){
            case "nc_":
                if(!this.isDeviceAvalibale(sourceID,postindex)){
                    let obj = {
                        count: this.posts[postindex].netcontrollers.length + 1,
                        name: sourceID.name,
                        boardid: sourceID.boardid,
                        //timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].netcontrollers.push(obj);
                    console.log('+Network controller added');
                }
                else{
                    console.log('Device type exists');
                }
                break;

            case "pc_":
                if(!this.isDeviceAvalibale(sourceID,postindex)){
                    let obj = {
                        count: this.posts[postindex].portcontrollers.length + 1,
                        name: sourceID.name,
                        boardid: sourceID.boardid,
                        //timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].portcontrollers.push(obj);
                    console.log('+Port controller added');
                }
                else{
                    console.log('Device type exists');
                }
                break;
            
            case "cc_":
                if(!this.isDeviceAvalibale(sourceID,postindex)){
                    let obj = {
                        count: this.posts[postindex].cabinetcontrollers.length + 1,
                        name: sourceID.name,
                        boardid: sourceID.boardid,
                        //timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].cabinetcontrollers.push(obj);
                    console.log('+Cabinet controller added');
                }
                else{
                    console.log('Device type exists');
                }
                break;
            
            case "tmc":
                if(!this.isDeviceAvalibale(sourceID,postindex)){
                    let obj = {
                        count: this.posts[postindex].themalcontrollers.length + 1,
                        name: sourceID.name,
                        boardid: sourceID.boardid,
                        //timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].themalcontrollers.push(obj);
                    console.log('+t=Thermal controller added');
                }
                else{
                    console.log('Device type exists');
                }
                break;

            case "esv":
                if(!this.isDeviceAvalibale(sourceID,postindex)){
                    let obj = {
                        count: this.posts[postindex].envcontrollers.length + 1,
                        name: sourceID.name,
                        boardid: sourceID.boardid,
                        //timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].envcontrollers.push(obj);
                    console.log('+Environment controller added');
                }
                else{
                    console.log('Device type exists');
                }
                break;
    
            default:
                console.log("source can not recognize :",sourceID.name);
                break;
        }

        /*
        console.log("----------------------------- Post start");
        const justtodisplay = this.posts.find(item => item.postid === sourceID.postid);
        console.log("result_post ",justtodisplay);
        console.log("----------------------------- Post end");
        */
        this.printDevices();
        
    }

    isDeviceAvalibale(sourceID,postindex){
        let result_id  ;

        switch(sourceID.name){
            case "nc_":
                result_id = this.posts[postindex].netcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "pc_":
                result_id = this.posts[postindex].portcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "cc_":
                result_id = this.posts[postindex].cabinetcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "tmc":
                result_id = this.posts[postindex].themalcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "esv":
                result_id = this.posts[postindex].envcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
        }

        return result_id ? true : false; 

    }

    getBoardID(){
        let result_id = 999 ;

        switch(sourceID.name){
            case "nc_":
                result_id = this.posts[postindex].netcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "pc_":
                result_id = this.posts[postindex].portcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "cc_":
                result_id = this.posts[postindex].cabinetcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "tmc":
                result_id = this.posts[postindex].themalcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            case "esv":
                result_id = this.posts[postindex].envcontrollers.find(item => item.boardid === sourceID.boardid);
                return result_id;
            default :
                return result_id;
        }

    }

    getPostID(sourceID){
        return this.posts.find(item => item.postid === sourceID.postid);
    }

    printDevices(){
        console.log(`\x1b[92mpost-+-name-+-bid--------===========\x1b[00m`);
        for(var i =0 ; i< this.posts.length ;i++){
            console.log(this.posts[i].postid)
            for(var j =0 ; j< this.posts[i].netcontrollers.length ;j++){
                console.log(`       ${this.posts[i].netcontrollers[j].name}     ${this.posts[i].netcontrollers[j].boardid}`)   
            }
            for(var j =0 ; j< this.posts[i].portcontrollers.length ;j++){
                console.log(`       ${this.posts[i].portcontrollers[j].name}    ${this.posts[i].portcontrollers[j].boardid}`)  
            }
            for(var j =0 ; j< this.posts[i].cabinetcontrollers.length ;j++){
                console.log(`       ${this.posts[i].cabinetcontrollers[j].name}    ${this.posts[i].cabinetcontrollers[j].boardid}`)  
            }
            for(var j =0 ; j< this.posts[i].themalcontrollers.length ;j++){
                console.log(`       ${this.posts[i].themalcontrollers[j].name}    ${this.posts[i].themalcontrollers[j].boardid}`)  
            }
            for(var j =0 ; j< this.posts[i].envcontrollers.length ;j++){
                console.log(`       ${this.posts[i].envcontrollers[j].name}    ${this.posts[i].envcontrollers[j].boardid}`)  
            }
        }
        console.log(`\x1b[92m====================================\x1b[00m`);
    }

    decodeCommandSeven(msg){

    }

    dec2bin(dec) {
        return dec.toString(2).padStart(8, '0');
      };
    
    bin2dec(bin) {
        return parseInt(bin, 2);
      };
        
    print(msg){
        console.log(msg,canCmd['c']);
        }
    
}

    

module.exports = { CAN };
