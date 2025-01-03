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

  while (true) {
    let selection;

    if (currentPage === 1) {
      selection = await createPage('Command Type', ['Request', 'Responce']);
      if (selection === 'Request') {
        console.log(`Selected: Request`);
      } 
      else if (selection === 'Responce') {
        console.log(`Selected: Response`);
      }
      currentPage = 2;
    } 
    
    else if (currentPage === 2) {
      selection = await createPage('Error Type', [
        'Normall',
        'Fault',
        'Busy',
        'Invalid Commad',
        'Invalid Data']);
      if (selection === 'Normal'){
        console.log(`Selected: Normal`);
      }else if (selection === 'Fault'){
        console.log(`Selected: Fault`);
      }else if (selection === 'Busy'){
        console.log(`Selected: Busy`);
      }else if (selection === 'Invalid Command'){
        console.log(`Selected: Invalid Command`);
      }else if (selection === 'Invalid Data'){
        console.log(`Selected: Invalid Data`);
      }else if (selection === 'Fault') {
        console.log(`Selected: Fault`);
      }else if (selection === 'Back') {
        currentPage = 3;
        console.log(`Back`);
      }
    } 

    else if (currentPage === 3) {
        selection = await createPage('From Controller Type', [
          'Port Controller',
          'Cabinet Controller',
          'Network Controller',
          'Thermal Management Controller',
          'Environmental Sensor Controller',
          'Broadcast',
        ]);
      
        if (selection === 'Port Controller') {
          console.log('Selected: Port Controller');
        } else if (selection === 'Cabinet Controller') {
          console.log('Selected: Cabinet Controller');
        } else if (selection === 'Network Controller') {
          console.log('Selected: Network Controller');
        } else if (selection === 'Thermal Management Controller') {
          console.log('Selected: Thermal Management Controller');
        } else if (selection === 'Environmental Sensor Controller') {
          console.log('Selected: Environmental Sensor Controller');
        } else if (selection === 'Broadcast') {
          console.log('Selected: Broadcast');
        } else if (selection === 'Back') {
          currentPage = 2;
          console.log('Returning to main page...');
        }
      }
      
      else if (currentPage === 4) {
        selection = await createPage('To Controller Type', [
          'Port Controller',
          'Cabinet Controller',
          'Network Controller',
          'Thermal Management Controller',
          'Environmental Sensor Controller',
          'Broadcast',
        ]);
      
        if (selection === 'Port Controller') {
          console.log('Selected: Port Controller');
        } else if (selection === 'Cabinet Controller') {
          console.log('Selected: Cabinet Controller');
        } else if (selection === 'Network Controller') {
          console.log('Selected: Network Controller');
        } else if (selection === 'Thermal Management Controller') {
          console.log('Selected: Thermal Management Controller');
        } else if (selection === 'Environmental Sensor Controller') {
          console.log('Selected: Environmental Sensor Controller');
        } else if (selection === 'Broadcast') {
          console.log('Selected: Broadcast');
        } else if (selection === 'Back') {
          currentPage = 2;
          console.log('Returning to main page...');
        }
      }

      else if (currentPage === 5) {
        selection = await createPage('Command Type', [
          '0x00',
          '0x01',
          '0x02',
          '0x03',
          '0x04',
          'Broadcast',
        ]);
      
        if (selection === 'Port Controller') {
          console.log('Selected: Port Controller');
        } else if (selection === 'Cabinet Controller') {
          console.log('Selected: Cabinet Controller');
        } else if (selection === 'Network Controller') {
          console.log('Selected: Network Controller');
        } else if (selection === 'Thermal Management Controller') {
          console.log('Selected: Thermal Management Controller');
        } else if (selection === 'Environmental Sensor Controller') {
          console.log('Selected: Environmental Sensor Controller');
        } else if (selection === 'Broadcast') {
          console.log('Selected: Broadcast');
        } else if (selection === 'Back') {
          currentPage = 2;
          console.log('Returning to main page...');
        }
      }
    
  }
}

// Start navigation
navigatePages();
