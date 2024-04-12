const { Router } =require('express')
const fs = require('fs')
const { Server } = require('socket.io')    
const ProductManager = require(`${__dirname}/../../public/js/productManager`)

const router = Router()

const filename = `${__dirname}/../../FileProducts.json`
const productsManager = new ProductManager(filename)

const initializeProductManager = async () =>{
    // await productsManager.initialize();
}

initializeProductManager()

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

// Router realTimeProducts

router.get('/realTimeProducts', async (req,res)=>{
    try{

    }catch{

    }
})


module.exports = router