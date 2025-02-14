const {  Comm , Decoder, Encoder} = require('./lib/can-test2.js');
const canbus = require('./nodecan.json');
const testCases = require('./test_cases.json');
const { logger } = require('./lib/log.js');
const { CodeGen } = require('ajv');

const can = new Comm();
const decoder = new Decoder(can);
const encoder = new Encoder(can);

function test_message_encode_and_decode(){
    /**
     * Testing packet enncoding and decoding in walkin 
    */
    const cases = testCases.messages;

    var msg = {
        id: 0,
        data: Buffer.from([0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88])
    }

    var buf = Buffer.alloc(4);
    var result = [];
    var total_test_cases = cases.length;
    var element_pass_count = 0;
     
    for (var i=0; i< cases.length ; i++ ){
        console.log(`--------- Test ${i} start`);
       buf = encoder.encode(cases[i][0],cases[i][1],cases[i][2],cases[i][3],cases[i][4],cases[i][5],cases[i][6],cases[i][7],cases[i][8],'');
       msg.id = buf[3] + (buf[2] << 8) + (buf[1] << 16 ) + (buf[0] << 24) ; // calculate the id in integer based on the 4 byte buffer 

       result = decoder.decode(msg);
       console.log(`${cases[i][1]} ${parseInt(result[1])} ${cases[i][2]} ${parseInt(result[2])}`);
       
        (canbus["source"]["type"][cases[i][0]] == parseInt(result[0]))?  element_pass_count++ : console.log("❌ 0 test fail ");
        (cases[i][1] == parseInt(result[1])) ? element_pass_count++ : console.log("❌ 1 test fail ");
        (cases[i][2] == parseInt(result[2])) ? element_pass_count++ : console.log("❌ 2 test fail ");
        (canbus["destination"]["type"][cases[i][3]] == parseInt(result[3])) ? element_pass_count ++ :console.log("❌ 3 test fail ");
        (cases[i][4] == parseInt(result[4])) ? element_pass_count++ : console.log("❌ 4 test fail ");
        (cases[i][5] == parseInt(result[5])) ? element_pass_count++ : console.log("❌ 5 test fail ");
        (canbus["type"][cases[i][6]] == parseInt(result[6])) ? element_pass_count++ : console.log("❌ 6 test fail ");
        (canbus["error"][cases[i][7]] == parseInt(result[7])) ? element_pass_count++ : console.log("❌ 7 test fail ");
        (canbus["command"][cases[i][8]]["number"] == parseInt(result[8])) ? element_pass_count++ : console.log("❌ 8 test fail ");

        console.log(`--------- Test ${i} end`);
        
    
    }
    console.log("\n\n\n\n")
    console.log(`Pass tests: ${element_pass_count}/${total_test_cases*9}`)
    console.log(`Test passes %: ${(element_pass_count/(total_test_cases*9))*100} %`);

    can.stop();
    
}
test_message_encode_and_decode()

const gracefulkill = () => {
    can.stop();
};

process.on('SIGINT', gracefulkill)