/*
===========
Schema
===========

const Ajv = require("ajv")
const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string"}
  },
  required: ["foo"],
  additionalProperties: false
}

const validate = ajv.compile(schema)

const data = {
  foo: 1,
  bar: "abc"
}

const valid = validate(data)
if (!valid) console.log(validate.errors)
    else console.log("success")
*/

function dothis(){
  buf = Buffer.from([0x00,0x0a,0x40,0x00]);
  console.log( buf[3] + (buf[2] << 8) + (buf[1] << 16 ) + (buf[0] << 24) );

  var num = 10;
  console.log(10 << 8 | 10);


}

dothis();


