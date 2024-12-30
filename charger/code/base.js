const { CAN } = require('./lib/can.js');
const { logger } = require('./lib/log.js');
const can = new CAN();

/*
 *  
 * cancomm
 *  commandType :  'req','res' 
 *  canError    :  'normal','okay','busy','invalcmd','invaldat'
 *  canCommand  :   0,1,2,3,4,5,6,7,8
 *  canSource   :  'pc_','cc_','nc_','tmc','esc','brd'
 *  canDestin   :  'pc_','cc_','nc_','tmc','esc','brd'
 * 
*/

var cancomm = {
    cmdType : 'req',    // 
    canErr  : 'normal', // 'normal','okay','busy','invalcmd','invaldat'
    camCmd  : 1,        // 
    }

function dothis(){
    can.walk();
    can.send('nc_','cc_','req','normal',7,1)
    
    //can.send('nc_','brd_','res_','invaldat',1,1);
    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);




