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

function getControlleName(board){
    switch(board){
        case '000': return `\x1b[92mPC \x1b[00m`;
        case '001': return `\x1b[92mCC \x1b[00m`;
        case '010': return `\x1b[92mNC \x1b[00m`;
        case '011': return `\x1b[92mTMC\x1b[00m`;
        case '100': return `\x1b[92mESV\x1b[00m`;
        case '111': return `\x1b[92mBRD\x1b[00m`;
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
        console.log('CAN channel started.');
        /*
        channel.addListener('onMessage', (msg) => {
              count++;
              this.decode(msg);
            });
        */
        }
    
    stop(){
        /*
        stops the channel
        */
        channel.stop();
        console.log('CAN channel stopped.');
        } 

    assembleId(src,des,cmdtype,canerr,cancmd){
        const firstbyte = nodecan["type"][cmdtype] << nodecan.error.nbits | nodecan["error"][canerr];
        const secondbyte = nodecan["command"][cancmd]["number"];
        const thirdbyte = ((nodecan["source"]["type"][src] << nodecan.source.post.nbits | 0b00 ) << nodecan.source.board.nbits ) | 0b000;
        const forthbyte = ((nodecan["destination"]["type"][des] << nodecan.destination.post.nbits | 0b00 ) << nodecan.destination.board.nbits) | 0b000;
        
        const id = Buffer.from([firstbyte.toString(2).padStart(8,'0'),
            secondbyte.toString(2).padStart(8,'0'),
            thirdbyte.toString(2).padStart(8,'0'),
            forthbyte.toString(2).padStart(8,'0')
        ]);
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
        console.log("messge id:",msg.id);
        console.log("messge data:",msg.data);

        const type = id[nodecan.type.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.type.bitlocation.start,nodecan.type.bitlocation.end);
        const error = id[nodecan.error.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.error.bitlocation.start,nodecan.error.bitlocation.end);
        const command = id[nodecan.command.bytelocation];
        const source = id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.type.bitlocation.start,nodecan.source.type.bitlocation.end);
        const sourcePostId = id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.post.bitlocation.start,nodecan.source.post.bitlocation.end);
        const sourceBoardId = id[nodecan.source.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.source.board.bitlocation.start,nodecan.source.board.bitlocation.end);

        const destination = id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.type.bitlocation.start,nodecan.destination.type.bitlocation.end);
        const desPostId = id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.post.bitlocation.start,nodecan.destination.post.bitlocation.end);
        const desBoardId = id[nodecan.destination.bytelocation].
                        toString(2).padStart(8,'0').
                            slice(nodecan.destination.board.bitlocation.start,nodecan.destination.board.bitlocation.end);
                
        console.log(`\x1b[92m - - - + - - -\x1b[00m`)
        console.log("type       ",type,getCmmandType(type));
        console.log("error      ",error,getErrType(error));
        console.log("command    ",command,parseInt(command,16));
        console.log("source     ",source,getControlleName(source));
        console.log("   portid  ",sourcePostId,parseInt(sourcePostId,2));
        console.log("   boardid ",sourceBoardId,parseInt(sourceBoardId,2));
        console.log("destination",destination,getControlleName(destination));
        console.log("   portid  ",desPostId,parseInt(desPostId,2));
        console.log("   boardid ",desBoardId,parseInt(desBoardId,2));
        console.log(`\x1b[92m - - - + - - -\x1b[00m`);
    }



  }

module.exports = { CanModule };