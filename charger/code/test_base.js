const { CanModule } = require('./lib/can-test.js');
const canbus = require('./nodecan.json');
const testCases = require('./test_cases.json');
const { logger } = require('./lib/log.js');
const can = new CanModule();


function main(){
    const cases = testCases.messages[0];
    for (var i=0; i< cases.length ; i++ ){
        can.decode(cases[0],)
    }
    
}
main()

