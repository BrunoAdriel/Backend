const fs = require('fs');
const express = require('express');
const handlebars = require('express-handlebars');
const prodCarro = require('./routes/prod.router');
const viewRouter = require('./routes/views.router');
const { Server } = require('socket.io');
const userModel = require('./routes/userModel.router');
const mongoose = require('mongoose');
const paginationRouter = require('./routes/pagination.router');
const http = require('http');
const passport = require('passport');
const initializeGithubStrategy = require('./config/passport-github.config');
const initializePassportStrategy = require('./config/passport.config');
const cookieParser = require('cookie-parser');
const initializeJWTStrategy = require('./config/passport.jwt.config');
const cluster = require('cluster');
const { cpus } = require('os');

// Session de middlewear mas coneccion al session mongo
const sessionMiddleware = require('./sessions/sessionStorage');

if (cluster.isPrimary) {
    console.log(`Proceso primario: ${process.pid}`);

    const numCpus = cpus().length;
    for (let i = 0; i < numCpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} terminado. Código: ${code}, señal: ${signal}`);
        console.log('Iniciando un nuevo worker...');
        cluster.fork();
    });
} else {
    const app = express();
    const server = http.createServer(app);

    // creando servidor para WebSocket
    const io = new Server(server);

    app.set('io', io);
    // Activar la coneccion a mongo
    app.use(sessionMiddleware);
    // Coneccion de passport con nuestra app
    initializeGithubStrategy();
    initializePassportStrategy();
    initializeJWTStrategy();
    app.use(passport.initialize());
    app.use(passport.session());
    
    //Coneccion de cookies
    app.use(cookieParser());

    // Configuracion de HANDLEBARS
    app.engine('handlebars', handlebars.engine());
    app.set('views', `${__dirname}/views`);
    app.set('view engine', 'handlebars');

    // Setea la carpeta public como estatica
    app.use(express.static(`${__dirname}/../public`));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    //Vinculaciones hacia toda la pagina
    app.use('/', viewRouter);
    app.use('/api/sessions', require('./routes/session.router'));
    app.use('/pagination', paginationRouter);
    app.use('/chat', viewRouter);
    app.use('/api/userModel', userModel);
    app.use('/home', viewRouter);
    app.use('/realTimeProducts', viewRouter);
    app.use('/api/carts', prodCarro);
    app.use('/api/ticket', require('./routes/ticketRouter'));

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
            res.send({ status: 'ERROR', message: 'Producto no encontrado' });
        } else {
            res.json(productFound);
        }
    });

    app.post('/products', async (req, res) => {
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
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        newProd.id = newId;
        products.push(newProd);

        // Guarda el array actualizado de vuelta en el archivo
        await fs.promises.writeFile(__dirname + '/../../Backend/src/FileProducts.json', JSON.stringify(products, null, 2));

        res.json({ status: 'success', product: newProd });
    });

    app.put('/products/:pid', async (req, res) => {
        const data = await fs.promises.readFile(__dirname + '/../../Backend/src/FileProducts.json', 'utf-8');
        let products = JSON.parse(data);
        const prodId = parseInt(req.params.pid);
        const prodData = req.body;
        delete prodData.id;

        const prodIdx = products.findIndex(product => product.id === prodId);

        if (prodIdx < 0) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        // Actualiza los datos del producto y aseguramos del id sea el mismo 
        products[prodIdx] = { ...products[prodIdx], ...prodData, id: prodId };

        await fs.promises.writeFile(__dirname + '/../../Backend/src/FileProducts.json', JSON.stringify(products, null, 2));

        res.json({ status: 'success', product: products[prodIdx] });
    });

    app.delete('/products/:prodId', async (req, res) => {
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

        res.json({ status: 'success', message: 'Producto eliminado correctamente' });
    });

    // Coneccion Mongoose
    const main = async () => {
        await mongoose.connect('mongodb+srv://adrielbruno08:Kq0gHxHj98JQCrBi@codertest.iijpsgz.mongodb.net/?retryWrites=true&w=majority&appName=CoderTest', {
            dbName: 'coder-test'
        });

         // Evento cunado un cliente se conecta
        io.on('connection', (socket) => {
            console.log('New client connected');
            // Aca podes manejar eventos de Socket, si los necesitas
            const messages = [];
            app.set('ws', io);

            // Chat de clientes
            socket.on('new-message', (msg) => {
                const message = { id: socket.id, text: msg };
                messages.push(message);
                io.emit('message', message);
            });
        });

        server.listen(8080, () => {
            console.log('Server up!');
        });
    };
    main();
}
