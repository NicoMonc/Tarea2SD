const express = require('express')
const cors = require("cors");
const { Kafka } = require('kafkajs')

const app = express()
const port = process.env.PORT

app.use(cors());
app.use(express.json());

const kafka = new Kafka({
  brokers: [process.env.kafkaHost]
});

const producer = kafka.producer();

app.get('/', (req, res) => {
  res.send('Rutas habilitadas: miembro, venta y aviso')
})

app.post('/miembro', (req,res) =>{

  var miembro = {"name":req.body.name,"lastname":req.body.lastname,"rut":req.body.rut,"email":req.body.email,"patente":req.body.patente,"premium":req.body.premium}
  console.log(miembro)
  res.send('Crear nuevo miembro por medio de get')
})

app.post('/venta', (req,res) =>{

  var venta = {"cliente":req.body.cliente,"sopaipas":req.body.num,"hora":req.body.hora,"ubicacion":req.body.ubicacion}
  console.log(venta)

  res.send('Formato: "cliente&&num&&hora&&ubicacion"')
})

app.post('/aviso' , (req,res) =>{
  res.send('Aviso')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})