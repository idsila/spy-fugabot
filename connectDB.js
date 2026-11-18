require('dotenv').config();
const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.URI);
const db =  client.db('main');

const DB = {};

function connect(name){
  DB[name] = db.collection(name);
  return DB[name];
}

client.connect().then(() => { console.log("DATABASE CONNECTED!"); }).catch((e) => { console.log(e); });

module.exports = { connect };