const { CAN } = require('./lib/can.js');
const can = new CAN();

function dothis(){
    can.send();
    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);

