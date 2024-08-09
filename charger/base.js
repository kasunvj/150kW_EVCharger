const { CAN } = require('./can.js');
const can = new CAN();

function dothis(){
    can.print("aa");
    }
    
dothis()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);

