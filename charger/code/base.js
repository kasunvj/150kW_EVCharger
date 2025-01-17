/**
 * @par base.js 
 * @param operation_mode
 *            0: request user input for messages
 *            1: sending predefiend can message
 *            2: test cases 
 * @param log_level
 *            0: no logs
 *            1: colord logs
 */

const { CanModule } = require('./lib/can-test.js');
const canbus = require('./nodecan.json');
const { logger } = require('./lib/log.js');
const can = new CanModule();
const opmode = parseInt(process.argv[2]);

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

function delay(ms) {    
  return new Promise(resolve => setTimeout(resolve, ms));
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
        Input cutom message and decode
        */
        while(true){
          const input = await test_getUserInput('id(hex) 12345678: ');
          msg.id = parseInt(input,16);
          can.decode(msg);
        }

        break;
    case 1:
        /*
        Send can messages back to back
        */
        while(true){
          can.send("nc","brd","request","normal","net_sync","");
          await delay(500);
        }
        
        break;
    case 2:
        /*
        Test Mode
        */ 
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




