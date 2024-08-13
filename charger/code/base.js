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
    can.createMachines(1,1,1,1,1);
    console.log(can.netcontrollers);
    can.send();
    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);

