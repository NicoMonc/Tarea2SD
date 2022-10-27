const express = require('express')
const cors = require("cors");
const { Kafka } = require('kafkajs')
const { Client } = require('pg')

//Conexión base de datos
const connectionString = 'postgresql://root:facil123@database:5432/sopaipillas'

const client = new Client({
  connectionString,
})
client.connect()

//"Configuracion librerias"
const app = express()
const port = process.env.PORT
app.use(cors());
app.use(express.json());

//Configuración Kafka
const kafka = new Kafka({
  brokers: [process.env.kafkaHost]
});
const producer = kafka.producer();

const ventas = async () => {
    
}

const miembros = async () => {
    
}

const reportes = async () => {
    
}

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    auth();
});