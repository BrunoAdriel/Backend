const { Router } =require('express')
const fs = require('fs')
const { Server } = require('socket.io')    
const ProductManager = require('../../public/js/productManager')
const io = require('socket.io');
const User = require('../models/user.model')

const manager = new ProductManager(`${__dirname}/../FileProducts.json`)
const router = Router()

// handle index
router.get('/', (req,res)=>{
    const isLoggedIn = ! [null,undefined].includes(req.session.user)
    res.render('index', {
        title:'Proyecto',
        name:'Backend',
        useWS: true,
        isLoggedIn,
        isNotLoggedIn: !isLoggedIn,
    })
})

// Router register
router.get('/register', (_, res)=>{
    res.render('register', {
        title: 'Registro de usuarios'
    })
})

// Router Login
router.get('/login',(_,res)=>{
    res.render('login',{
        title:' Inicio de sesion '
    })
})

// Rouuter Profile
router.get('/profile', async (req,res)=>{

    const idSession = req.session.user._id

    const user = await User.findOne({_id: idSession})
    
    res.render('profile', {
        title: 'My  Profile',
        user: {
            firstName: user.firstName,
            lastName : user.lastName,
            email: user.email
        }
    })
})

// Router chat
router.get('/chat', (_, res)=>{
    res.render('chat',{
        useWS: true,
        scripts: [ 'index.js' ]
    })
})

// Router Home
router.get('/home', async(_, res) => {
    try {
        // Lee el contenido del archivo FileProducts.json
        const productData = await fs.promises.readFile(`src/FileProducts.json`, 'utf8');
        // Parsea el contenido del archivo como JSON
        const products = JSON.parse(productData);

        res.render('home', {
            title: 'Home',
            products
        });
    } catch (error) {
        console.error("Error al cargar los productos:", error);
        res.status(500).json({ error: 'Error al cargar los productos' });
    }
});


router.get('/realTimeProducts', async (_, res)=>{
    try{
        const products = await manager.getProducts()

        const prodsData = products.map(prod =>({
            title: prod.title,
            description: prod.description,
            price: prod.price,
            thumbnail: prod.thumbnail,
            code: prod.code,
            stock: prod.stock
        }))

        res.render('realTimeProducts',{
            title: 'realTimeProducts',
            products: prodsData,
            script: ['realTimeProducts.js'],
            useWS: true
        })
    }catch(error){
        console.error("Error al cargar los productos:",error)
            res.status(500).send('Error al cargar los productos')
    }
})

router.post('/realTimeProducts', async (req, res) => {
    console.log(req.body)
    // agrego el producto nuevo
    try{
        const newProductData = await manager.addProduct(
            req.body.title,
            req.body.description,
            +req.body.price,
            req.body.thumbnail,
            req.body.code,
            +req.body.stock);

        const io = req.app.get('io');
        if (io) {
            io.emit('newProduct', newProductData);
        } else {
            console.error("Socket.IO no está disponible");
        }
        res.redirect('/realTimeProducts')
    }catch(error){
        console.error("Error al agregar el producto nuevo", error)
        res.status(500).send('Error al agregar el producto nuevo')
    }
})


router.get('/carts/:cid', async (req, res) => {
    try {
        const cid = parseInt(req.params.cid)
        const carritoData = await fs.promises.readFile(__dirname + '/../carrito.json', 'utf-8');
        const carrito = JSON.parse(carritoData)

        if (carrito.id === cid) {
            return res.json(carrito.products)
        } else {
            console.log('No se encontró el carrito')
            return res.status(404).json({ message: 'No se encontró el carrito' })
        }
    } catch (error) {
        console.error('Error al obtener el carrito:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
});


module.exports = router