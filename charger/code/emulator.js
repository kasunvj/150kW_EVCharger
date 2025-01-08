const blessed = require('blessed');
const can = require('socketcan');
const channel = can.createRawChannel('can0', true);
const canbus = require('./nodecan.json');

// Create the main screen
const screen = blessed.screen({
  smartCSR: true,
  title: 'CAN Message Emulator',
});

// Utility function to create a page and return a promise
function createPage(title, items) {
  return new Promise((resolve) => {
    const list = blessed.list({
      top: 'center',
      left: 'center',
      width: '50%',
      height: '50%',
      label: title,
      border: { type: 'line' },
      style: {
        selected: { bg: 'blue' },
      },
      items: [...items, 'Back', 'Quit'], // Add "Back" and "Quit" options
      keys: true,
      mouse: true,
      vi: true,
    });

    screen.append(list);

    // Handle item selection
    list.on('select', (node, index) => {
      const selectedOption = list.getItem(index).content;
      if (selectedOption === 'Back') {
        resolve('Back');
      } else if (selectedOption === 'Quit') {
        process.exit(0);
      } else {
        resolve(selectedOption);
      }
    });

    // Focus on the list and render
    list.focus();
    screen.render();
  });
}

// Function to navigate between pages
async function navigatePages() {
  let currentPage = 1;
  let type,error,sourcetype,sourcepost,sourceboard,destype,despost,desboard;
  var command = Buffer.alloc(1);
  let firstbyte,secondbyte,thirdbyte,fourthbyte;
  let str=":";

  while (true) {
    let selection;
    
    
    //1 
    if (currentPage === 1) {
      selection = await createPage('Command Type', ['Request', 'Responce']);
      if (selection === 'Request') {
        console.log(`Selected: Request`);
        str = str + "request ";
        type = canbus.type.request;

      } 
      else if (selection === 'Responce') {
        console.log(`Selected: Response`);
        str = str + "responce ";
        type = canbus.type.responce;
        currentPage = 1;      
      }

      currentPage = 2;
      console.log(`\x1b[93m${type.toString(2).padStart(canbus.type.nbits,'0')}\x1b[00m`) 
      console.log(str)
    }

    //2
    else if (currentPage === 2) {
      selection = await createPage('Error Type', [
        'Normal',
        'Fault',
        'Busy',
        'Invalid Commad',
        'Invalid Data']);

      if (selection === 'Normal'){
        console.log('Selected: Normal');
        str = str + "normal ";
        error = canbus.error.normal
      }else if (selection === 'Fault'){
        console.log(`Selected: Fault`);
        str = str + "fault ";
        error = canbus.error.fault
      }else if (selection === 'Busy'){
        console.log(`Selected: Busy`);
        str = str + "busy";
        error = canbus.error.busy
      }else if (selection === 'Invalid Command'){
        console.log(`Selected: Invalid Command`);
        str = str + "inval_cmd";
        error = canbus.error.invalcmd
      }else if (selection === 'Invalid Data'){
        console.log(`Selected: Invalid Data`);
        str = str + "inval_busy";
        error = canbus.error.invaldata
      }
      
      if (selection === 'Back') {
        currentPage = 1;
        console.log(`Back`);
      }
      else{
        currentPage = 3;
      }
     
      
      firstbyte = (type << canbus.error.nbits) | error ;
      console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')}\x1b[00m`);
      
    } 

    //3
    else if (currentPage === 3) {
      selection = await createPage('Command Type', [
        '0x00',
        '0x01',
        '0x02',
        '0x03',
        '0x04',
        '0x05',
        '0x06',
        '0x07',
        '0x08',
        '0x09',
        'Broadcast',
      ]);
    
      if (selection === '0x00') {
        console.log('Selected: set ota packet (req)NC-(resp)Any');
        str = str + "cmd: 00";
        command = Buffer.from([0x00]);
      } else if (selection === '0x01') {
        console.log('Selected: set configuration packet (req)NC-(resp)Any');
        str = str + "cmd: 01";
        command = Buffer.from([0x01]);
      } else if (selection === '0x02') {
        console.log('Selected: set req voltage (req)PC-(resp)CC');
        str = str + "cmd: 02";
        command = Buffer.from([0x02]);
      } else if (selection === '0x03') {
        console.log('Selected: get max voltage (req)PC-(resp)CC');
        str = str + "cmd: 03";
        command = Buffer.from([0x03]);
      } else if (selection === '0x04') {
        console.log('Selected: set port auth (req)NC-(resp)PC');
        str = str + "cmd: 04";
        command = Buffer.from([0x04]);
      } else if (selection === '0x05') {
        console.log('Selected: get port measurement (req)NC-(resp)PC');
        str = str + "cmd: 05";
        command = Buffer.from([0x05]);
      } else if (selection === '0x06') {
        console.log('Selected: set tmc temp (req)CC-(resp)TMC');
        str = str + "cmd: 06";
        command = Buffer.from([0x06]);
      } else if (selection === '0x07') {
        console.log('Selected: set ECS state (req)ECS-(resp)BRD');
        str = str + "cmd: 07";
        command = Buffer.from([0x07]);
      }else if (selection === '0x08') {
        console.log('Selected: set max power (req)NC-(resp)CC');
        str = str + "cmd: 08";
        command = Buffer.from([0x08]);
      }else if (selection === '0x09') {
        console.log('Selected: set log data (req)PC/CC-(resp)BRD');
        str = str + "cmd: 09";
        command = Buffer.from([0x09]);
      }
      
      if (selection === 'Back') {
        currentPage = 2;
        console.log('backing..');
      }
      else{
        currentPage = 4;
      }
      

      secondbyte = command[0].toString(2);
      console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')} ${secondbyte.toString(2).padStart(8,'0')}\x1b[00m`);
      
    }

    //4
    else if (currentPage === 4) {
        selection = await createPage('Source - Controller Type)-', [
          'Port Controller',
          'Cabinet Controller',
          'Network Controller',
          'Thermal Management Controller',
          'Environmental Sensor Controller',
          'Broadcast',
        ]);
      
        if (selection === 'Port Controller') {
          console.log('(Source): Port Controller');
          str = "(source)pc ";
          sourcetype = canbus.source.type.pc.toString(2);
        } else if (selection === 'Cabinet Controller') {
          console.log('(Source): Cabinet Controller');
          sourcetype = canbus.source.type.cc.toString(2);
        } else if (selection === 'Network Controller') {
          console.log('(Source): Network Controller');
          sourcetype = canbus.source.type.nc.toString(2);
        } else if (selection === 'Thermal Management Controller') {
          console.log('(Source): Thermal Management Controller');
          sourcetype = canbus.source.type.tmc.toString(2);
        } else if (selection === 'Environmental Sensor Controller') {
          console.log('(Source): Environmental Sensor Controller');
          sourcetype = canbus.source.type.esc.toString(2);
        } else if (selection === 'Broadcast') {
          console.log('(Source): Broadcast');
        }
        
        if (selection === 'Back') {
          currentPage = 3;
          console.log('backing..');
        }else{
          currentPage = 5;
        }


        
      }
      
      //5
      else if (currentPage === 5){
        selection = await createPage('Post No', [
          '00',
          '01',
          '02',
          '03',
          '04',
          '05'
        ]);

        if(selection === '00'){
          console.log('     +--- post 00');
          str = "post 00 ";
          sourcepost = canbus.source.post.post0.toString(2);
        }else if(selection === '01'){
          console.log('     +--- post 01');
          sourcepost = canbus.source.post.post1.toString(2);
        }else if(selection === '02'){
          console.log('     +--- post 02');
          sourcepost = canbus.source.post.post2.toString(2);
        }else if(selection === '03'){
          console.log('     +--- post 03');
          sourcepost = canbus.source.post.post3.toString(2);
        }else if(selection === '04'){
          console.log('     +--- post 04');
          sourcepost = canbus.source.post.post4.toString(2);
        }else if(selection === '05'){
          console.log('     +--- post 05');
          sourcepost = canbus.source.post.post5.toString(2);
        }
        
        if (selection === 'Back') {
          currentPage = 4;
          console.log('Returning to main page...');
        }else{
          currentPage = 6;
        }
        
      }

        //6
        else if (currentPage === 6){
          selection = await createPage('Board No', [
            '00',
            '01',
            '02',
            '03',
            '04',
            '05'
          ]);
  
          if(selection === '00'){
            console.log('     +--- board 00');
            str = "board 00 ";
            sourceboard = canbus.source.board.board0.toString(2);
          }else if(selection === '01'){
            console.log('     +--- board 01');
            sourceboard = canbus.source.board.board1.toString(2);
          }else if(selection === '02'){
            console.log('     +--- board 02');
            sourceboard = canbus.source.board.board2.toString(2);
          }else if(selection === '03'){
            console.log('     +--- board 03');
            sourceboard = canbus.source.board.board3.toString(2);
          }else if(selection === '04'){
            console.log('     +--- board 04');
            sourceboard = canbus.source.board.board4.toString(2);
          }else if(selection === '05'){
            console.log('     +--- board 05');
            sourceboard = canbus.source.board.board5.toString(2);
          }
          
          if (selection === 'Back') {
            currentPage = 5;
            console.log('backing..');
          }else{
            currentPage = 7; 
          }

          thirdbyte = (((type << canbus.source.post.nbits) | sourcepost ) << canbus.source.board.nbits) | sourceboard ; 
          console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')} ${secondbyte.toString(2).padStart(8,'0')} ${thirdbyte.toString(2).padStart(8,'0')}\x1b[00m`)
        }

        //7
        else if (currentPage === 7) {
          selection = await createPage('Destination -Controller Type', [
            'Port Controller',
            'Cabinet Controller',
            'Network Controller',
            'Thermal Management Controller',
            'Environmental Sensor Controller',
            'Broadcast',
          ]);
        
          if (selection === 'Port Controller') {
            console.log('(Destination): Port Controller');
            destype = canbus.destination.type.pc.toString(2)
          } else if (selection === 'Cabinet Controller') {
            console.log('(Destination): Cabinet Controller');
            destype = canbus.destination.type.cc.toString(2)
          } else if (selection === 'Network Controller') {
            console.log('(Destination): Network Controller');
            destype = canbus.destination.type.nc.toString(2);
          } else if (selection === 'Thermal Management Controller') {
            console.log('(Destination): Thermal Management Controller');
            destype = canbus.destination.type.tmc.toString(2)
          } else if (selection === 'Environmental Sensor Controller') {
            console.log('(Destination): Environmental Sensor Controller');
            destype = canbus.destination.type.esc.toString(2)
          } else if (selection === 'Broadcast') {
            console.log('(Destination): Broadcast');
          } 
          
          if (selection === 'Back') {
            currentPage = 6;
            console.log('backing...');
          }else{
            currentPage = 8;
          }
          
        }

        //8
        else if (currentPage === 8){
          selection = await createPage('Post No', [
            '00',
            '01',
            '02',
            '03',
            '04',
            '05'
          ]);

          if(selection === '00'){
            console.log('      +------- post 00');
            despost = canbus.destination.post.post0.toString(2)
          }else if(selection === '01'){
            console.log('      +------- post 01');
            despost = canbus.destination.post.post1.toString(2)
          }else if(selection === '02'){
            console.log('      +------- post 02');
            despost = canbus.destination.post.post2.toString(2)
          }else if(selection === '03'){
            console.log('      +------- post 03');
            despost = canbus.destination.post.post3.toString(2)
          }else if(selection === '04'){
            console.log('      +------- post 04');
            despost = canbus.destination.post.post4.toString(2)
          }else if(selectSelectedion === '05'){
            console.log('      +------- post 05');
            despost = canbus.destination.post.post5.toString(2)
          }
          
          if (selection === 'Back') {
            currentPage = 7;
            console.log('backing...');
          }else{
            currentPage = 9;
          }
          
        }

          //9
          else if (currentPage === 9){
            selection = await createPage('Board No', [
              '00',
              '01',
              '02',
              '03',
              '04',
              '05'
            ]);
    
            if(selection === '00'){
              console.log('      +------- board 00');
              desboard = canbus.destination.board.board0.toString(2);
            }else if(selection === '01'){
              console.log('      +------- board 01');
              desboard = canbus.destination.board.board1.toString(2);
            }else if(selection === '02'){
              console.log('      +------- board 02');
              desboard = canbus.destination.board.board2.toString(2);
            }else if(selection === '03'){
              console.log(' +-----    board 03');
              desboard = canbus.destination.board.board3.toString(2);
            }else if(selection === '04'){
              console.log(' +-----    board 04');
              desboard = canbus.destination.board.board4.toString(2);
            }else if(selection === '05'){
              console.log(' +-----    board 05');
              desboard = canbus.destination.board.board5.toString(2);
            }
            if (selection === 'Back') {
              currentPage = 8;
              console.log('backing..');
            } 
            else{

            }
            console.log(desboard);

            fourthbyte = (((type << canbus.destination.post.nbits) | despost ) << canbus.destination.board.nbits) | desboard ; 
            console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')} ${secondbyte.toString(2).padStart(8,'0')} ${thirdbyte.toString(2).padStart(8,'0')} ${fourthbyte.toString(2).padStart(8,'0')}\x1b[00m`);
            console.log('\x1b[92m ID: ')
            console.log(Buffer.from([firstbyte,secondbyte,thirdbyte,fourthbyte]));
            console.log(str);
            console.log('\x1b[00m')
        }
            
          


  }
}

// Start navigation
navigatePages();
