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
  var firstbyte = 0b00000000;
  var secondbyte= 0b00000000;
  var thirdbyte= 0b00000000;
  var fourthbyte= 0b00000000;
  let str="";

  while (true) {
    let selection;
    
    
    //1 
    if (currentPage === 1) {
      selection = await createPage('Command Type', ['Request', 'Responce']);
      if (selection === 'Request') {
        str = str + "cmdtyp: request, \n";
        type = canbus.type.request;

      } 
      else if (selection === 'Responce') {
        str = str + "cmdtyp: responce, \n";
        type = canbus.type.responce;
        currentPage = 1;      
      }


      currentPage = 2;
      console.log(`\x1b[93m${type.toString(2).padStart(canbus.type.nbits,'0')}\x1b[00m`) 
      console.log(str+"\n")
    }

    //2
    else if (currentPage === 2) {
      selection = await createPage('Error Type', [
        'Normal',
        'Fault',
        'Busy',
        'Invalid Command',
        'Invalid Data']);

      if (selection === 'Normal'){
        str = str + "errtyp: normal, \n";
        error = canbus.error.normal
      }else if (selection === 'Fault'){
        str = str + "errtyp: fault, \n";
        error = canbus.error.fault
      }else if (selection === 'Busy'){
        str = str + "errtyp: busy, \n";
        error = canbus.error.busy
      }else if (selection === 'Invalid Command'){
        str = str + "errtyp: inval_cmd, \n";
        error = canbus.error.invalcmd
      }else if (selection === 'Invalid Data'){
        str = str + "errtyp: inval_busy, \n";
        error = canbus.error.invaldata
      }else{
        str = str + selection;
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
      console.log(str);
      
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
        '0x0a'
      ]);
    
      if (selection === '0x00') {
        str = str + "00 set_ota nc->any, \n";
        command = canbus.command.set_ota.number;
      } else if (selection === '0x01') {
        str = str + "01 set_config nc->any, \n";
        command = canbus.command.set_config.number.number;
      } else if (selection === '0x02') {
        str = str + "02 set_voltagecurent pc->cc, \n";
        command = canbus.command.set_voltagecurent.number;
      } else if (selection === '0x03') {
        str = str + "03 command.get_maxvoltage pc->cc, \n";
        command = canbus.command.get_maxvoltage.number;
      } else if (selection === '0x04') {
        str = str + "04 set_portauth nc->pc, \n";
        command = canbus.command.set_portauth.number;
      } else if (selection === '0x05') {
        str = str + "05 get_portmesurement nc->pc, \n";
        command = canbus.command.get_portmesurement.number;
      } else if (selection === '0x06') {
        str = str + "06 get_tmctemp cc->tmc, \n";
        command = canbus.command.get_tmctemp.number;
      } else if (selection === '0x07') {
        str = str + "07 set_escstate ecs->brdc, \n";
        command = canbus.command.set_escstate.number;
      }else if (selection === '0x08') {
        str = str + "08 set_maxpower nc->cc, \n";
        command = canbus.command.set_maxpower.number;
      }else if (selection === '0x09') {
        str = str + "09 set_logdata pc/cc->brd, \n";
        command = canbus.command.set_logdata.number;
      }else if (selection === '0x0a') {
        str = str + "0a net_sync nc->brd, \n";
        command = canbus.command.net_sync.number;
      }
      
      if (selection === 'Back') {
        currentPage = 2;
        console.log('backing..');
      }
      else{
        currentPage = 4;
      }
      

      secondbyte = parseInt(command);
      console.log(">?>",command)
      console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')} ${secondbyte.toString(2).padStart(8,'0')}\x1b[00m`);
      console.log(str);
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
          str = str+ "(source)pc, ";
          sourcetype = canbus.source.type.pc;
        } else if (selection === 'Cabinet Controller') {
          str = str+ "(source)cc, ";
          sourcetype = canbus.source.type.cc;
        } else if (selection === 'Network Controller') {
          str = str+ "(source)nc, ";
          sourcetype = canbus.source.type.nc ;
        } else if (selection === 'Thermal Management Controller') {
          str = str+ "(source)tmc, ";
          sourcetype = canbus.source.type.tmc;
        } else if (selection === 'Environmental Sensor Controller') {
          str = str+ "(source)esc, ";
          sourcetype = canbus.source.type.esc;
        } else if (selection === 'Broadcast') {
          str = str+ "(source)bcast, ";
          sourcetype = canbus.source.type.brd;
        }
        
        if (selection === 'Back') {
          currentPage = 3;
          console.log('backing..');
        }else{
          currentPage = 5;
        }

        str = str+ "\n";
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
          str = str+ "  post 00, ";
          sourcepost = canbus.source.post.post0;
        }else if(selection === '01'){
          str = str+ "  post 01, ";
          sourcepost = canbus.source.post.post1;
        }else if(selection === '02'){
          str = str+ "  post 02, ";
          sourcepost = canbus.source.post.post2;
        }else if(selection === '03'){
          str = str+ "  post 03, ";
          sourcepost = canbus.source.post.post3;
        }else if(selection === '04'){
          str = str+ "  post 04, ";
          sourcepost = canbus.source.post.post4;
        }else if(selection === '05'){
          str = str+ "  post 05, ";
          sourcepost = canbus.source.post.post5;
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
            str = str+ "  board 00, ";
            sourceboard = canbus.source.board.board0;
          }else if(selection === '01'){
            str = str+ "  board 01,  ";
            sourceboard = canbus.source.board.board1;
          }else if(selection === '02'){
            str = str+ "  board 02, ";
            sourceboard = canbus.source.board.board2;
          }else if(selection === '03'){
            str = str+ "  board 03, ";
            sourceboard = canbus.source.board.board3;
          }else if(selection === '04'){
            str = str+ "  board 04, ";
            sourceboard = canbus.source.board.board4;
          }else if(selection === '05'){
            str = str+ "  board 05, ";
            sourceboard = canbus.source.board.board5;
          }
          
          if (selection === 'Back') {
            currentPage = 5;
            console.log('backing..');
          }else{
            currentPage = 7; 
          }
          


          thirdbyte = (((sourcetype << canbus.source.post.nbits) | sourcepost ) << canbus.source.board.nbits) | sourceboard ; 
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

          str = str+ "\n";
        
          if (selection === 'Port Controller') {
            str = str+ "(des)pc, ";
            destype = canbus.destination.type.pc;
          } else if (selection === 'Cabinet Controller') {
            str = str+ "(des)pc, ";
            destype = canbus.destination.type.cc;
          } else if (selection === 'Network Controller') {
            str = str+ "(des)nc, ";
            destype = canbus.destination.type.nc;
          } else if (selection === 'Thermal Management Controller') {
            str = str+ "(des)tmc, ";
            destype = canbus.destination.type.tmc;
          } else if (selection === 'Environmental Sensor Controller') {
            str = str+ "(des)esc, ";
            destype = canbus.destination.type.esc;
          } else if (selection === 'Broadcast') {
            str = str+ "(des)bcast, ";
            destype = canbus.destination.type.brd;
          } 
          
          if (selection === 'Back') {
            currentPage = 6;
            console.log('backing...');
          }else{
            currentPage = 8;
          }
          
          str = str+ "\n";
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
            str = str+ "  post 00, ";
            despost = canbus.destination.post.post0;
          }else if(selection === '01'){
            str = str+ "  post 01, ";
            despost = canbus.destination.post.post1;
          }else if(selection === '02'){
            str = str+ "  post 02, ";
            despost = canbus.destination.post.post2;
          }else if(selection === '03'){
            str = str+ "  post 03, ";
            despost = canbus.destination.post.post3;
          }else if(selection === '04'){
            str = str+ "  post 04, ";
            despost = canbus.destination.post.post4;
          }else if(selectSelectedion === '05'){
            str = str+ "  post 05, ";
            despost = canbus.destination.post.post5;
          }
          
          if (selection === 'Back') {
            currentPage = 7;
            console.log('backing...');
          }else{
            currentPage = 9;
          }

          str = str+ "\n";
          
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
              str = str+ "  board 00, ";
              desboard = canbus.destination.board.board0;
            }else if(selection === '01'){
              str = str+ "  board 01, ";
              desboard = canbus.destination.board.board1;
            }else if(selection === '02'){
              str = str+ "  board 02, ";
              desboard = canbus.destination.board.board2;
            }else if(selection === '03'){
              str = str+ "  board 03, ";
              desboard = canbus.destination.board.board3;
            }else if(selection === '04'){
              str = str+ "  board 04, ";
              desboard = canbus.destination.board.board4;
            }else if(selection === '05'){
              str = str+ "  board 05, ";
              desboard = canbus.destination.board.board5;
            }
            if (selection === 'Back') {
              currentPage = 8;
              console.log('backing..');
            } 
            else{
              currentPage = 10;
            }
            
            str = str+ "\n";
            fourthbyte = (((destype << canbus.destination.post.nbits) | despost ) << canbus.destination.board.nbits) | desboard ; 
            console.log(`\x1b[93m${firstbyte.toString(2).padStart(8,'0')} ${secondbyte.toString(2).padStart(8,'0')} ${thirdbyte.toString(2).padStart(8,'0')} ${fourthbyte.toString(2).padStart(8,'0')}\x1b[00m`);
            console.log('\x1b[92m ID: ')
            console.log(firstbyte,secondbyte,thirdbyte,fourthbyte);
            console.log(Buffer.from([firstbyte,secondbyte,thirdbyte,fourthbyte]));
            console.log('\x1b[00m');
            console.log(str);
        }

          //10
          else if (currentPage === 10){
            selection = await createPage('Done', [ ]);
            
            if (selection === 'Back') {
              currentPage = 8;
              console.log('backing...');
            }else{
            }

          }
            
          


  }
}

// Start navigation
navigatePages();
