
const canbus = require('./nodecan.json');
function myfun(){
    let type = canbus.type.responce;
    let error = canbus.error.fault;
    console.log(type.toString(2))
    console.log((type<<3 | error).toString(2))

    console.log('-----------------')
    let type1 = canbus.type.responce.toString(2).padStart(canbus.type.nbits,'0');
    let error1 = canbus.error.fault.toString(2).padStart(canbus.error.nbits,'0');
    console.log(type1)
    console.log(error1)
    console.log(type1.toString(2))
    console.log((type1<<3 | error1).toString(2))

    console.log('-----------------')

    console.log(Buffer.from([0xab]))
    console.log(`eded ${Buffer.from([0xab])}`);
}
myfun();