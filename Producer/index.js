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

//Rutas
app.get('/', async (req, res) => {
  res.send('Rutas habilitadas: miembro, venta y aviso')
})

app.post('/miembro', async (req, res) =>{

  var miembro = {"name":req.body.name,"lastname":req.body.lastname,"rut":req.body.rut,"email":req.body.email,"patente":req.body.patente,"ubicacion":req.body.ubicacion,"stock":req.body.stock,"autorepo":req.body.autorepo,"premium":req.body.premium}

  const corrusuario = await client.query('SELECT * FROM miembros where rut = $1',[miembro.rut])
  const corrcarrito = await client.query('SELECT * FROM carritos where patente = $1',[miembro.patente])
  
  if(corrusuario.rowCount!=0 || corrcarrito.rowCount!=0){
    res.send("Usuario y/o carrito ya está registrado")
  }else{
    const miembrodata = 'INSERT INTO miembros(nombre, apellido, rut,email,patenteCar,premium) VALUES ($1, $2, $3,$4,$5,$6)'
    await client.query(miembrodata, [miembro.name, miembro.lastname, miembro.rut,miembro.email,miembro.patente,miembro.premium])
      
    const carritodata = 'INSERT INTO carritos(patente, ubicacion,stock,autorepo) VALUES ($1, $2, $3,$4)'
    await client.query(carritodata, [miembro.patente,miembro.ubicacion,miembro.stock,miembro.autorepo])
  
    await producer.connect();
    await producer.send({
        topic: 'miembros',
        messages: [{value: JSON.stringify(req.body)}]
    })
    await producer.disconnect().then(
        res.status(200).json({
          "Estado":"Completado"
      })
    )
  }
})

app.post('/venta', async (req, res) =>{

  var venta = {"cliente":req.body.cliente,"sopaipas":req.body.num,"hora":req.body.hora,"patente":req.body.patente,"ubicacion":req.body.ubicacion}

  //var fecha=new Date().toLocaleString('es-CL',{timeZone: 'America/Santiago',})

  const infocarrito = await client.query('SELECT patente,stock FROM carritos where patente = $1',[venta.patente])
  if(infocarrito.rowCount==0){
    res.send("Carrito no existe, venta no será registrada")
  }else{
    var stock = infocarrito.rows[0].stock;
    var restante=stock - venta.sopaipas;
    if(restante<0){
      res.send("Cantidad solicitada mayor a stock actual")
    }else{
      const ventadata = 'INSERT INTO ventas(cliente,patente, cant, hora,stock,ubi) VALUES ($1, $2, $3,$4,$5,$6)'
      await client.query(ventadata, [venta.cliente,venta.patente, venta.sopaipas, venta.hora,restante,venta.ubicacion])
      const updateCarrito = 'UPDATE carritos SET ubicacion = $1, stock= $2 WHERE patente= $3'
      await client.query(updateCarrito, [venta.ubicacion, restante, venta.patente])
      
      await producer.connect();
      await producer.send({
          topic: 'ventas',
          messages: [{value: JSON.stringify(req.body)}]
      })
      await producer.disconnect().then(
          res.status(200).json({
            "Estado":"Completado"
        })
      ) 
    }
  }
})

app.post('/verificacion', async (req,res)=>{
  var patente=req.body.patente
  var ubicacion= req.body.ubicacion
  req.body.situacion= "actualizacion"
  const updateCarrito = 'UPDATE carritos SET ubicacion = $1 WHERE patente= $2'
  await client.query(updateCarrito, [ubicacion, patente])
  await producer.connect();
      await producer.send({
          topic: 'reportes',
          messages: [{value: JSON.stringify(req.body)}]
      })
      await producer.disconnect().then(
          res.status(200).json({
            "Estado":"Completado"
        })
      ) 
})

app.post('/aviso' , async (req, res) =>{
  var patente = req.body.patente;
  var ubicacion = req.body.ubicacion
  req.body.situacion = "alerta"
  const infocarrito = await client.query('SELECT patente,ubicacion FROM carritos where patente = $1',[patente])
  var ubiactual= infocarrito.rows[0].ubicacion
  if(ubiactual==ubicacion){
    res.send("Señora, es la misma ubicacion :D")
  }else{
    const ventadata = 'INSERT INTO reportes(patente,ubi) VALUES ($1, $2)'
    await client.query(ventadata, [patente,ubicacion])
    await producer.connect();
      await producer.send({
          topic: 'reportes',
          messages: [{value: JSON.stringify(req.body)}]
      })
      await producer.disconnect().then(
          res.status(200).json({
            "Estado":"Completado"
        })
      ) 
  }
})

app.listen(port, () => {
  console.log(`Productor funcionando en puerto ${port}`)
})