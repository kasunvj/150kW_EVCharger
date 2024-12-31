const canbus = require('./nodecan.json');
const can = require('socketcan');
 
const num = 42; // Example number
const binary = num.toString(2);

function myfun(src){
    console.log(`${src.toString(2)}`)
    //console.log(`${src.parseInt(2)}`)
}

myfun(canbus.board.tmc)