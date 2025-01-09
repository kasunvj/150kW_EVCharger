
const canbus = require('./nodecan.json');
input = "a";

msg = {"A":1,
    "B":{
        "a":20,
        "b":21
    },
    "C":3
}

function myfun(input){
    console.log(msg["B"][input])
}
myfun(input);