const { CanModule } = require('./lib/can-test.js');
const canbus = require('./nodecan.json');
const { logger } = require('./lib/log.js');
const can = new CanModule();

var cancomm = {
    cmdType : 'req',    
    canErr  : 'normal', 
    camCmd  : 1,        
    }

function dothis(){
    //can.walk();
    can.send(canbus.board.tmc,
        canbus.board.cc,
        canbus.type.request,
        canbus.error.normal,
        canbus.command.set_ota.number,1)

    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);




