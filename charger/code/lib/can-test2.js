const nodecan = require('../nodecan.json');
const EventEmitter = require('events');
const can = require('socketcan');
const channel = can.createRawChannel('can0', true);
const fs = require('fs');

count = 0;
const opmode = parseInt(process.argv[2]);
const logginglevel = parseInt(process.argv[3]);

var message = {
    id: 0x123, // CAN ID
    data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
    ext: true, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
    timestamp: Date.now() // Optional: current timestamp
  };

function getControlleName(board){
    /**
     * @param board : int 
     * @returns string of names with colours
    */
    switch(board){
        case 0: return `\x1b[92mPC \x1b[00m`;
        case 1: return `\x1b[92mCC \x1b[00m`;
        case 2: return `\x1b[92mNC \x1b[00m`;
        case 3: return `\x1b[92mTMC\x1b[00m`;
        case 4: return `\x1b[92mESV\x1b[00m`;
        case 7: return `\x1b[92mBRD\x1b[00m`;
    }
}

function getCmmandType(board){
    /**
     * @param board : string 
     * @returns string of names with colours
    */
    switch(board){
        case '00': return `\x1b[92mREQ \x1b[00m`;
        case '01': return `\x1b[92mRSP \x1b[00m`;
    }
}

function getErrType(board){
    /**
     * @param board : string 
     * @returns string of names with colours
    */
    switch(board){
        case '000': return `\x1b[92mNORMAL\x1b[00m`;
        case '001': return `\x1b[92mFAULT \x1b[00m`;
        case '010': return `\x1b[92mBUSY  \x1b[00m`;
        case '011': return `\x1b[92mINVCMD\x1b[00m`;
        case '100': return `\x1b[92mINVDAT\x1b[00m`;
        
    }
}

function logging(level,color,msg){
    /**
     * @param level : logging level. 0: no loggs 1:logging with colours 
     * @param color : 'y','g','r'
     * @param msg : message
     */

    let startString = ''
    let endString = '\x1b[00m'
    switch(color){
    case 'y':
        startString = '\x1b[93m';
        break;
    case 'g':
        startString = '\x1b[92m';
        break;
    case 'r':
        startString = '\x1b[91m';
        break;
    default:
        startString = '';

    }
    switch(level){
        case 0:
            break;
        case 1:
            console.log(`${startString}${msg}${endString}`);
            break;
        default:
            console.log(msg);
            break;
    }
}

class Comm{
    constructor(){
        this.posts = [];
        this.start();
    }

    start(){
        /**
         * Starting CAN listen
        */
        this.posts = [];
        channel.start();
        
        switch(opmode){
            case 0:
                logging(logginglevel,'r',"CAN channel started and listening.");
                channel.addListener('onMessage', (msg) => {
                    count++;
                    this.emit('messageReceived',msg)
                  });
                break;
            case 1:
                logging(logginglevel,'r',`CAN channel started in test mode.\n   In this mode, can will not listen in to actual can bus.\n   Test messges directly redirect to decode `);
                break;
            default:
                logging(logginglevel,'r',`Mode is not defined`);
                break;
                
        }
        
        
        }
    
    stop(){
        /*
        stops the channel
        */
        channel.stop();
        logging(logginglevel,'r',"CAN channel stopped.");
        } 

    

    send(src,srcpid,srcbid,des,despid,desbid,type,errorcode,command,candata){
        /**
         * @param src : source (string)
         * @param srcpid : source post id (int)
         * @param srcbid : source board id (int)
         * @param des : destination (string)
         * @param despid : destination post id (int)
         * @param desbid : destination baord id (int)
         * @param cmdtype : command type string 
         * @param canerr :can error string
         * @param cancmd : command string
         * @returns None
         */
        console.log(`${src.toString(2).padStart(nodecan.protocol.bits.src,"0")}`);
        console.log(`${des.toString(2).padStart(nodecan.protocol.bits.des,"0")}`);
        console.log(`${type.toString(2).padStart(nodecan.protocol.bits.type,"0")}`);
        console.log(`${errorcode.toString(2).padStart(nodecan.protocol.bits.errorcode,"0")}`);
        console.log(`${command.toString(2).padStart(nodecan.protocol.bits.command,"0")}`);
        
        //message.id = '0x'+ this.encode(src,srcpid,srcbid,des,despid,desbid,type,errorcode,command).toString('hex');
        message.id = this.encode(src,srcpid,srcbid,des,despid,desbid,type,errorcode,command);
        //message.data = this.assembleData(candata);
        
        console.log("---- CANBUS -----");
        console.log(message.id);
        console.log(message.data);
        console.log("---- CANBUS -----");
        /*
        logging(logginglevel,'y',"msg sending .. ")
        channel.send(message);
        */
    }
}
    
class UpdateNetwork{
    constructor(comm){
        this.comm = comm;
    }

    update(source,sourcePostId,sourceBoardId){
        /**
         * Updating devices in the CAN network 
         * @param source : int , decoded source type 
         * @param sourcePostId: int , decoded source post ID
         * @param sourceBoardId: int , decoded source board ID
        */
        const result_post = this.comm.posts.find(item => item.postid === sourcePostId);
        if(result_post){
            logging(logginglevel,'r',"post exists");
        }else{
            logging(logginglevel,'g',"post creating");
            let obj = {
                postid : sourcePostId,
                netcontrollers :[],
                portcontrollers :[],
                cabinetcontrollers :[],
                themalcontrollers :[],
                envcontrollers :[],
                timestamp: new Date().toISOString()
            };
            this.comm.posts.push(obj);
        }

        const postindex = this.comm.posts.findIndex(item => item.postid === sourcePostId);
        this.isThisBoardAvilable(postindex,source,sourceBoardId)
        
        //adding devices in the post 
        switch(source){
            case nodecan.source.type.pc:
                //port controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.pc,sourceBoardId)){
                    let obj = {
                        count: this.comm.posts[postindex].portcontrollers.length + 1,
                        boardid: sourceBoardId,
                        //fill from command 0x02
                        action: nodecan.command.set_voltagecurent.request.action.value,
                        contactor: nodecan.command.set_voltagecurent.request.contactor.value,
                        pcstate : nodecan.command.set_voltagecurent.request.state.value,
                        cabletemp: nodecan.command.set_voltagecurent.request.cabletemp.value,
                        reqvoltage: nodecan.command.set_voltagecurent.request.requestVoltage.value,
                        reqcurrent: nodecan.command.set_voltagecurent.request.requestCurrent.value,
                        //fill from command 0x04
                        cstate: nodecan.command.set_portauth.responce.chargingState.value,
                        ecode: nodecan.command.set_portauth.responce.ecode.value,
                        protocol: nodecan.command.set_portauth.responce.protocol.value,
                        soc: nodecan.command.set_portauth.responce.soc.value,
                        instvoltage: nodecan.command.set_portauth.responce.instVoltage.value,
                        instcurrent: nodecan.command.set_portauth.responce.instCurrent.value,
                        //fill from command 0x05
                        accenergy: nodecan.command.get_portmesurement.responce.accEnergy.value,
                        instpower: nodecan.command.get_portmesurement.responce.instPower.value,
                        //fill from command 0x09
                        multiplexor: nodecan.command.set_logdata.request.multiplexor.value,
                        logData : nodecan.command.set_logdata.request.logData.value

                        
                    };
                    this.comm.posts[postindex].portcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;

            case nodecan.source.type.cc:
                //cabinet controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.cc,sourceBoardId)){
                    let obj = {
                        count: this.comm.posts[postindex].cabinetcontrollers.length + 1,
                        boardid: sourceBoardId,
                        //fill from command 0x02
                        fbaction: nodecan.command.set_voltagecurent.responce.fbaction.value,
                        fbcontactor: nodecan.command.set_voltagecurent.responce.fbcontactor.value,
                        ccstate_to_pc : nodecan.command.set_voltagecurent.responce.state.value,
                        busvoltage: nodecan.command.set_voltagecurent.responce.busVoltage.value,
                        buscurrent: nodecan.command.set_voltagecurent.responce.busCurrent.value,
                        //fill from command 0x03
                        maxpower: nodecan.command.get_maxvoltage.responce.maxPower.value,
                        maxvoltage : nodecan.command.get_maxvoltage.responce.maxVolatge.value,
                        maxcurrent : nodecan.command.get_maxvoltage.responce.maxCurrent.value,
                        //fill from command 0x06
                        ccstate_to_tmc: nodecan.command.set_tmctemp.request.CCState.value,
                        cpowerout: nodecan.command.set_tmctemp.request.cabinetPowerOut.value,
                        maxtemp: nodecan.command.set_tmctemp.request.maxTemp.value,
                        mintemp: nodecan.command.set_tmctemp.request.minTemp.value,
                        avgtemp: nodecan.command.set_tmctemp.request.avgTemp.value,
                        //fill from command 0x08
                        defPower: nodecan.command.set_maxpower.responce.defPower.value,
                        voltageAB: nodecan.command.set_maxpower.responce.phaseABVoltage.value,
                        voltageBC: nodecan.command.set_maxpower.responce.phaseBCVoltage.value,
                        voltageCA: nodecan.command.set_maxpower.responce.phaseCAVoltage.value,
                        //fill from command 0x09
                        multiplexor: nodecan.command.set_logdata.request.multiplexor.value,
                        logData : nodecan.command.set_logdata.request.logData.value


                    };
                    this.comm.posts[postindex].cabinetcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;

            case nodecan.source.type.nc:
                //network controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.nc,sourceBoardId)){
                    let obj = {
                        count: this.comm.posts[postindex].netcontrollers.length + 1,
                        boardid: sourceBoardId,
                        //fill from command 0x04
                        chargingState: nodecan.command.set_portauth.request.chargingState.value,
                        ncstate: nodecan.command.set_portauth.request.ncstate.value,
                        protocol: nodecan.command.set_portauth.request.protocol.value,
                        //fill from command 0x08
                        maxPowerLim: nodecan.command.set_maxpower.request.maxPowerLimit.value
                    };
                    this.comm.posts[postindex].netcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;

            case nodecan.source.type.tmc:
                //themal controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.tmc,sourceBoardId)){
                    let obj = {
                        count: this.comm.posts[postindex].themalcontrollers.length + 1,
                        boardid: sourceBoardId,
                        coolanttemp: nodecan.command.set_tmctemp.responce.coolentTemp.value,
                        tmcstate: nodecan.command.set_tmctemp.responce.TMCState.value
                        
                    };
                    this.comm.posts[postindex].themalcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;

            case nodecan.source.type.esc:
                //envioment controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.esc,sourceBoardId)){
                    let obj = {
                        count: this.comm.posts[postindex].envcontrollers.length + 1,
                        boardid: sourceBoardId,
                        //fill from command 0x07
                        errorCode1: nodecan.command.set_escstate.request.errorCode1.value,
                        errorCode2: nodecan.command.set_escstate.request.errorCode2.value,
                        errorCode3: nodecan.command.set_escstate.request.errorCode3.value,
                        errorCode4: nodecan.command.set_escstate.request.errorCode4.value,
                    };
                    this.comm.posts[postindex].envcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;
            default :
                logging(logginglevel,'r',`node post to add or sync ${source}`)

        }
        //console.log(this.posts);
        
        const jsonData = JSON.stringify(this.comm.posts, null, 2);

        fs.writeFile('canlist.json', jsonData, (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
            } 
          });

        
    }

    isThisBoardAvilable(postindex,src,sourceBoardId){

        /**
         * @param postindex : int , post index
         * @param src : int , source type number
         * @param sourceBoardId : int , surce board number
         * @returns
         * 
        */
       console.log("+++++++++++++++++++++");
       console.log(postindex);
       console.log(src);
       console.log(sourceBoardId);
       console.log(this.comm)
       console.log("+++++++++++++++++++++");
        switch(src){
            case nodecan.source.type.pc:
                return this.comm.posts[postindex].portcontrollers.find(item => item.boardid === sourceBoardId);
            case nodecan.source.type.nc:
                return this.comm.posts[postindex].netcontrollers.find(item => item.boardid === sourceBoardId); 
            case nodecan.source.type.cc:
                return this.comm.posts[postindex].cabinetcontrollers.find(item => item.boardid === sourceBoardId); 
            case nodecan.source.type.esc:
                return this.comm.posts[postindex].envcontrollers.find(item => item.boardid === sourceBoardId);
            case nodecan.source.type.tmc:
                return this.comm.posts[postindex].themalcontrollers.find(item => item.boardid === sourceBoardId);
            default:
                return false;
        }
    }

}

class Decoder{
    constructor(comm){
        this.comm = comm;
    }

    decode(msg){
        /**
         * @param msg : can meesage object with id,data members 
         * @returns
         */
        
        var id = Buffer.alloc(4);
        id = Buffer.from(msg.id.toString(16).padStart(8,'0'),'hex');
        console.log("messge id:",msg.id);
        console.log("messge data:",msg.data);

        const type = id[nodecan.type.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.type.bitlocation.start,nodecan.type.bitlocation.end);
        const error = id[nodecan.error.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.error.bitlocation.start,nodecan.error.bitlocation.end);
        const command = id[nodecan.command.bytelocation];
        const source = parseInt(id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.type.bitlocation.start,nodecan.source.type.bitlocation.end),2);
        const sourcePostId = parseInt(id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.post.bitlocation.start,nodecan.source.post.bitlocation.end),2);
        const sourceBoardId = parseInt(id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.board.bitlocation.start,nodecan.source.board.bitlocation.end),2);

        const destination = parseInt(id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.type.bitlocation.start,nodecan.destination.type.bitlocation.end),2);
        const desPostId = parseInt(id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.post.bitlocation.start,nodecan.destination.post.bitlocation.end),2);
        const desBoardId = parseInt(id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.board.bitlocation.start,nodecan.destination.board.bitlocation.end),2);
        
        
        const updatetable = new UpdateNetwork(this.comm);

        switch(command){
            case 2:
                if(updatetable.isThisBoardAvilable(sourcePostId,source,sourceBoardId)){
                    console.log("avilable *************");
                }
                else{
                    console.log("not avilable *************");
                }
                
            case 10:
                
                updatetable.update(source,sourcePostId,sourceBoardId);
                break;
        }

        console.log(`\x1b[92m - - - + ${count} -\x1b[00m`)
        console.log("type       ",type,getCmmandType(type));
        console.log("error      ",error,getErrType(error));
        console.log("command    ",command);
        console.log("source     ",source,getControlleName(source));
        console.log("   portid  ",sourcePostId);
        console.log("   boardid ",sourceBoardId);
        console.log("destination",destination,getControlleName(destination));
        console.log("   portid  ",desPostId);
        console.log("   boardid ",desBoardId);
        console.log(`\x1b[92m - - - + - - -\x1b[00m`);

        var testSet = Buffer.from([source,sourcePostId,sourceBoardId,destination,desPostId,desBoardId,type,error,command]);
        return testSet;

        
    }


}

class Encoder{
    constructor(comm){
        this.comm = comm;
    }

    encode(src,srcpid,srcbid,des,despid,desbid,cmdtype,canerr,cancmd){
        /**
         * @param src : source (string)
         * @param srcpid : source
         *  post id (int)
         * @param srcbid : source board id (int)
         * @param des : destination (string)
         * @param despid : destination post id (int)
         * @param desbid : destination baord id (int)
         * @param cmdtype : command type string 
         * @param canerr :can error string
         * @param cancmd : command string
         * @returns CAN ID buffer
         */

        let firstbyte = 0;
        let secondbyte = 0;
        let thirdbyte = 0;
        let forthbyte = 0;

        if ((srcpid < 0)||(srcpid > 3)) logging(logginglevel,'r',"Source post id out of range");
        else if ((srcbid < 0)||(srcbid > 7)) logging(logginglevel,'r',"Source board id out of range"); 
        else if ((despid < 0)||(despid > 3)) logging(logginglevel,'r',"Destination post id out of range");
        else if ((desbid < 0)||(desbid > 7)) logging(logginglevel,'r',"Destination board id out of range");
        else{
        firstbyte = nodecan["type"][cmdtype] << nodecan.error.nbits | nodecan["error"][canerr];
        secondbyte = nodecan["command"][cancmd]["number"];
        thirdbyte = ((nodecan["source"]["type"][src] << nodecan.source.post.nbits | srcpid ) << nodecan.source.board.nbits ) | srcbid;
        forthbyte = ((nodecan["destination"]["type"][des] << nodecan.destination.post.nbits | despid ) << nodecan.destination.board.nbits) | desbid;
        }
        const id = Buffer.from([firstbyte,secondbyte,thirdbyte,forthbyte]);

        return id[3] + (id[2] << 8) + (id[1] << 16 ) + (id[0] << 24);
    }
}

module.exports = { Comm, Decoder, Encoder };