const { CanModule } = require('./lib/can-test.js');
const canbus = require('./nodecan.json');
const { logger } = require('./lib/log.js');
const can = new CanModule();
const opmode = 0;

const readline = require('readline');

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var cancomm = {
    cmdType : 'req',    
    canErr  : 'normal', 
    camCmd  : 1,        
    }

var msg = {
    id: 0,
    data: Buffer.from([0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88])
}

function test_getUserInput(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }


async function dothis(opmode){
    /*
    can.send(canbus.source.type.tmc,
        canbus.destination.type.cc,
        canbus.type.request,
        canbus.error.normal,
        canbus.command.set_ota.number,1)

    */
   switch(opmode){
    case 0:
        /*
        Test mode
        */
       while(true){
        const input = await test_getUserInput('id(hex) 12345678: ');
        msg.id = parseInt(input,16);
        can.decode(msg);
       }

        break;
    case 1:
        can.send("nc","pc","request","fault","set_config","");
        break;
    case 2:
        break;
   }

    }
    
dothis(opmode)

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill);
//process.on('SIGTERM', gracefulkill);
//process.on('exit', gracefulkill);




