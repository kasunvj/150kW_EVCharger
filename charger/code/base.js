const { CAN } = require('./lib/can.js');
const can = new CAN();

/*
 *  
 * cancomm
 *  commandType :  'req','res' 
 *  canError    :  'normal','okay','busy','invalcmd','invaldat'
 *  canCommand  :   1,2,3,4,5,6,7,8
 *  canSource   :  'pc','cc','nc','tmc','esc','brd'
 *  canDestin   :  'pc','cc','nc','tmc','esc','brd'
 * 
*/

var cancomm = {
    cmdType : 'req',    // 
    canErr  : 'normal', // 'normal','okay','busy','invalcmd','invaldat'
    camCmd  : 1,        // 
    }

function dothis(){
    can.walk();
    console.log(can.netcontrollers);
    
    can.send('nc','brd','res','invaldat',1,1);
    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);




