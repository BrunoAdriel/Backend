const { Router } =require('express')
const fs = require('fs')
const { Server } = require('socket.io')    
const ProductManager = require('../../public/js/productManager')

const manager = new ProductManager(`${__dirname}/../FileProducts.json`)
const router = Router()

// handle index
router.get('/', (_,res)=>{
    res.render('index', {
        title:'Mi pagina backend',
        name:'perri',
        useWS: true
    })
})

// Router register
router.get('/register', (_, res)=>{
    res.render('register', {
        title: 'Registro de usuarios'
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
        await manager.addProduct(
            req.body.title,
            req.body.description,
            +req.body.price,
            req.body.thumbnail,
            req.body.code,
            +req.body.stock);

        res.redirect('/realTimeProducts')
    }catch(error){
        console.error("Error al agregar el producto nuevo", error)
        res.status(500).send('Error al agregar el producto nuevo')
    }
    // notifico a los clientes X ws

    req.app.get('ws').emit('newProduct', req.body)
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