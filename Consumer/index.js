const express = require('express')
const cors = require("cors");
const { Kafka } = require('kafkajs')
const { Client } = require('pg')
const schedule = require('node-schedule'); //Libreria para programar revisión diaria

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

//Esto definirá 
const rule = new schedule.RecurrenceRule();
rule.hour = 23;
rule.minute = 59;

var ventaslistado=[]

const findia = schedule.scheduleJob(rule, async ()=>{
    const ventas = await client.query('SELECT rut.miembros,SUM(cant.ventas) as ventaTotal,AVG(cant.ventas) as promedio, count(cant.ventas) as clientes FROM miembros,ventas where patenteCar.miembros=patente.ventas')
    ventaslistado=ventas
});

var arrreportes=[]

const reportes = async () => {
    const consumereportes = kafka.consumer({ groupId: 'reportes', fromBeginning: true });
    await consumereportes.connect();
    await consumereportes.subscribe({ topic: 'reportes' });
    await consumereportes.run({
        eachMessage:async ({topic,partition,message}) =>{
            if(message.value){
                var data= JSON.parse(message.value.toString())
                console.log(data)
                arrreportes.push(data)
            }
        },
    })
}

var cantidad= 0
var cincoventas = []

const consventas = async () => {
    const consumerventas = kafka.consumer({ groupId: 'ventas', fromBeginning: true })
    await consumerventas.connect()
    await consumerventas.subscribe({ topic: 'ventas' })
    await consumerventas.run({
        eachMessage: async ({ topic, partition, message }) => {
            console.log("mensaje")
            if(message.value){
                var data= JSON.parse(message.value.toString())
                //relleno stock
                if(data.stock<20){
                    const infocarrito = await client.query('SELECT patente,autorepo FROM carritos where patente = $1',[data.patente])
                    var dato=infocarrito.rows[0].autorepo
                    var suma=dato+data.stock
                    const updateCarrito = 'UPDATE carritos SET stock = $1 WHERE patente= $2'
                    await client.query(updateCarrito, [suma, venta.patente])
                }
                if(cantidad==5){
                    console.log("5 ventas")
                    cantidad=0;
                    cincoventas=[]
                }
                console.log(data)
                cincoventas[cantidad]=data
                cantidad++;
                console.log(cantidad)
            }
        },
      })
}


app.get("/findia", async (req, res) => {
    res.send.json({
        ventaslistado
    })
});

app.get("/5ventas",async (req,res)=>{
    res.send("Hola")
})

app.get("/ubicaciones",async (req,res)=>{
    res.send.json({
        arrreportes
    })
})

app.listen(port, () => {
    console.log(`Consumidor funcionando en puerto ${port}`);
    consventas();
    reportes();
});