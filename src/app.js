const fs = require('fs')
const express = require('express')
const handlebars = require('express-handlebars')
const prodCarro = require('./routes/prod.router')
const viewRouter = require('./routes/views.router')
const { Server } = require('socket.io')
const chatRouter = require('./routes/views.router')
const homeRouter = require('./routes/views.router')
const realTimeRouter = require('./routes/views.router')
const userModel =require('./routes/userModel.router')
const mongoose = require('mongoose')
const paginationRouter =require('./routes/pagination.router')
const cardRouter = require('./routes/card.router')
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport')
const initializeGithubStrategy = require('./config/passport-github.config')
const initializePassportStrategy  = require('./config/passport.config')


const app = express()
const server = http.createServer(app);
const io = socketIo(server);
app.set('io', io);

// session de middlewear mas coneccion al session mongo
const sessionMiddleware = require('./sessions/sessionStorage')
app.use(sessionMiddleware)

// coneccion de passport con nuestra app
initializeGithubStrategy()
initializePassportStrategy ()
app.use(passport.initialize())
app.use(passport.session())


// Configuracion de HANDLEBARS
app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

// setea la carpeta public como estatica
app.use(express.static(`${__dirname}/../public`))

// Permitir el envio de informacion mediante Formularios y JSON 
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Mostrar la pantalla de inicio
app.use('/', viewRouter)

// Conexion a carro
// app.use('/carts/', cardRouter)

// conexion a sessionRouter
app.use('/api/sessions', require('./routes/session.router'))

// conexion a paginacion
app.use('/pagination', paginationRouter)

// Mostrar el chat
app.use('/chat', chatRouter)

// Conexion a userModel de Moongose
app.use('/api/userModel', userModel) //revisar antigua config de register

// Conexion a "HOME"
app.use('/home', homeRouter)

// Conexion a "RealTimeProducts"
app.use('/realTimeProducts', realTimeRouter)

// envio de datos de prodCarro a el path
app.use('/api/carts', prodCarro)

app.get('/products', async (req, res) => {
    // Lee el archivo y convierte el contenido de JSON a un objeto JavaScript
    const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
    let products = JSON.parse(data);
    
    // Si 'limit' es un número, limita la cantidad de productos devueltos
    const limit = parseInt(req.query.limit); 
    if (!isNaN(limit)) {
        products = products.slice(0, limit);
    }
    res.json(products);
});

app.get('/products/:pId', async (req, res) => {
    const pId = parseInt(req.params.pId);
    const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
    const products = JSON.parse(data);

    const productFound = products.find(p => p.id === pId);

    if (!productFound) {
        res.send({status: 'ERROR', message: 'Producto no encontrado'});
    } else {
        res.json(productFound);
    }
});

app.post('/products', async (req, res)=>{
  // chekea que los campos esten completos, sino devuelve el error400
const requiredFields = ['title', 'description', 'price', 'thumbnail', 'code', 'stock'];
for (const field of requiredFields) {
    if (!req.body[field]) {
        return res.status(400).json({ status: 'error', message: `El campo '${field}' es obligatorio` });
    }
}

const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
const products = JSON.parse(data);

const newProd = req.body;

  // Asigna un nuevo ID al producto
const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
newProd.id = newId;
products.push(newProd);

  // Guarda el array actualizado de vuelta en el archivo
    await fs.promises.writeFile(__dirname + '/../../Backend/src/FileProducts.json', JSON.stringify(products, null, 2));

    res.json({ status: 'success', product: newProd });
})

app.put('/products/:pid', async (req, res)=>{
    const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
    let products = JSON.parse(data);
    const prodId = parseInt(req.params.pid);
    const prodData = req.body;
    delete prodData.id;

    const prodIdx = products.findIndex(product => product.id === prodId);

    if (prodIdx < 0 ) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

  // Actualiza los datos del producto y aseguramos del id sea el mismo 
    products[prodIdx] = { ...products[prodIdx], ...prodData, id:prodId };

    await fs.promises.writeFile(__dirname + '/../../Backend/src/FileProducts.json', JSON.stringify(products, null, 2));

    res.json({ status: 'success', product: products[prodIdx] });
})

app.delete('/products/:prodId', async (req, res)=>{
    const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
    let products = JSON.parse(data);
    const prodId = parseInt(req.params.prodId);
    const prodIdx = products.findIndex(product => product.id === prodId);

    if (prodIdx < 0) {
        return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

  // Elimina el producto con la cantidad que ponga despues de la "," en esa posicion
    products.splice(prodIdx, 1);

    await fs.promises.writeFile(__dirname + '/../../Backend/src/FileProducts.json', JSON.stringify(products, null, 2));

    res.json({ status: 'success', message: 'Producto eliminado correctamente' })
})

// Coneccion Mongoose

const main = async () =>{
    await mongoose.connect(
        'mongodb+srv://adrielbruno08:Kq0gHxHj98JQCrBi@codertest.iijpsgz.mongodb.net/?retryWrites=true&w=majority&appName=CoderTest',
        {
            dbName: 'coder-test'
        }
    )

    io.on('connection', (socket) => {
        console.log('New client connected');
        // Aquí puedes manejar eventos de Socket.IO, si los necesitas
    
        // creando servidor para WebSocket
        const wsServer = new Server(httpServer)

        const messages = []
        app.set('ws', wsServer);

        // evento cunado un cliente se conecta
        wsServer.on('connection', (clientSocket)=>{
            console.log(`Cliente conectado, su ID es ${clientSocket.id} `)

            for(const message of messages){
                clientSocket.emit('message', message )
            }

            // chat de clientes
            clientSocket.on('new-message', (msg) => {
                const message = {id: clientSocket.id, text: msg}
                messages.push(message)
                wsServer.emit('message', message )
            })
        })
    });

    app.listen(8080, () => {
        console.log('Server up!')
    })
}
main()