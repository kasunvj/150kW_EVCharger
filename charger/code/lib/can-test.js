const nodecan = require('../nodecan.json');
const can = require('socketcan');
const channel = can.createRawChannel('can0', true);

count = 0;
const logginglevel = parseInt(process.argv[3]);

var message = {
    id: 0x123, // CAN ID
    data: Buffer.from([0x04, 0xd2, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06]), // Data payload
    ext: true, // Standard CAN ID (11-bit), set to true if using extended (29-bit) IDs
    timestamp: Date.now() // Optional: current timestamp
  };

function getControlleName(board){
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
    switch(board){
        case '00': return `\x1b[92mREQ \x1b[00m`;
        case '01': return `\x1b[92mRSP \x1b[00m`;
    }
}

function getErrType(board){
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
     * @param color : 'y','g',''
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

class CanModule{
    constructor(){
        this.posts = [];
        this.start();
    }

    start(){
        /*
        start the channel and start listening
        */
        this.posts = [];
        channel.start();
        logging(logginglevel,'r',"CAN channel started.");
        /*
        channel.addListener('onMessage', (msg) => {
              count++;
              this.decode(msg);
            });*/
        
        }
    
    stop(){
        /*
        stops the channel
        */
        channel.stop();
        logging(logginglevel,'r',"CAN channel stopped.");
        } 

    assembleId(src,des,cmdtype,canerr,cancmd){
        const firstbyte = nodecan["type"][cmdtype] << nodecan.error.nbits | nodecan["error"][canerr];
        const secondbyte = nodecan["command"][cancmd]["number"];
        const thirdbyte = ((nodecan["source"]["type"][src] << nodecan.source.post.nbits | 0b00 ) << nodecan.source.board.nbits ) | 0b000;
        const forthbyte = ((nodecan["destination"]["type"][des] << nodecan.destination.post.nbits | 0b00 ) << nodecan.destination.board.nbits) | 0b000;
        


        const id = Buffer.from([firstbyte,secondbyte,thirdbyte,forthbyte]);
        console.log("Out buffer: ",id);
        return id;
    }

    send(src,des,type,errorcode,command,candata){
        /*
        srcaddr: 'String' Source address. 
        */
        console.log(`${src.toString(2).padStart(nodecan.protocol.bits.src,"0")}`);
        console.log(`${des.toString(2).padStart(nodecan.protocol.bits.des,"0")}`);
        console.log(`${type.toString(2).padStart(nodecan.protocol.bits.type,"0")}`);
        console.log(`${errorcode.toString(2).padStart(nodecan.protocol.bits.errorcode,"0")}`);
        console.log(`${command.toString(2).padStart(nodecan.protocol.bits.command,"0")}`);
        
        message.id = '0x'+ this.assembleId(src,des,type,errorcode,command).toString('hex');
        //message.data = this.assembleData(candata);
        
        channel.send(message);
    }
    

    decode(msg){
        /*
        identifire - 29 bits (4 bytes)
        data - 8 bytes
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
        
        if(command == 10){
            this.updateCanDeviceTrable(source,sourcePostId,sourceBoardId);
        }

        console.log(`\x1b[92m - - - + - - -\x1b[00m`)
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
    }

    updateCanDeviceTrable(source,sourcePostId,sourceBoardId){
        //checking posts, add new one if not avilable
        const result_post = this.posts.find(item => item.postid === sourcePostId);
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
            this.posts.push(obj);
        }

        const postindex = this.posts.findIndex(item => item.postid === sourcePostId);
        this.isThisBoardAvilable(postindex,source,sourceBoardId)
        
        //adding devices in the post 
        switch(source){
            case nodecan.source.type.pc:
                //port controller
                if(!this.isThisBoardAvilable(postindex,nodecan.source.type.pc,sourceBoardId)){
                    let obj = {
                        count: this.posts[postindex].portcontrollers.length + 1,
                        boardid: sourceBoardId,
                        timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].portcontrollers.push(obj);
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
                        count: this.posts[postindex].cabinetcontrollers.length + 1,
                        boardid: sourceBoardId,
                        timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].cabinetcontrollers.push(obj);
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
                        count: this.posts[postindex].netcontrollers.length + 1,
                        boardid: sourceBoardId,
                        timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].netcontrollers.push(obj);
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
                        count: this.posts[postindex].themalcontrollers.length + 1,
                        boardid: sourceBoardId,
                        timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].themalcontrollers.push(obj);
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
                        count: this.posts[postindex].envcontrollers.length + 1,
                        boardid: sourceBoardId,
                        timestamp: new Date().toISOString()
                    };
                    this.posts[postindex].envcontrollers.push(obj);
                    logging(logginglevel,'g',`+ new ${getControlleName(source)} added`);
                }
                else{
                    logging(logginglevel,'r',`${getControlleName(source)} at post ${sourcePostId} board ${sourceBoardId} exists`);
                }
                break;
            default :
                logging(logginglevel,'r',`node post to add or sync ${source}`)

        }
        console.log(this.posts);
        const jsonData = JSON.stringify(cantree, null, 2)

        fs.writeFile('can-tree.json', jsonData, (err) => {
            if (err) {
              console.error('Error writing JSON file:', err);
            } else {
              console.log('JSON file created successfully: output.json');
            }
          });

        
    }

    isThisBoardAvilable(postindex,src,sourceBoardId){

        switch(src){
            case nodecan.source.type.pc:
                return this.posts[postindex].portcontrollers.find(item => item.boardid === sourceBoardId);
            case nodecan.source.type.nc:
                return this.posts[postindex].netcontrollers.find(item => item.boardid === sourceBoardId); 
            case nodecan.source.type.cc:
                return this.posts[postindex].cabinetcontrollers.find(item => item.boardid === sourceBoardId); 
            case nodecan.source.type.esc:
                return this.posts[postindex].envcontrollers.find(item => item.boardid === sourceBoardId);
            case nodecan.source.type.tmc:
                return this.posts[postindex].themalcontrollers.find(item => item.boardid === sourceBoardId);
            default:
                return false;
        }
    }



  }

module.exports = { CanModule };