const { Router } = require('express');
const fs = require('fs').promises;
const { authorizationMiddlewear } = require('../utils/authorizationMiddlewar')
const Products = require('../models/products.model');

const router = Router();

// filtrar por cantidad de productos pasados por query
router.get('/', async (req, res) => {
    try {
        const prodFilter = req.query.prodFilter;
        let products;
        if (prodFilter) {
            const numberParse = parseInt(prodFilter, 10);
            if (numberParse <= 0 || isNaN(numberParse) || !prodFilter) {
                res.status(404).json({ message: 'Error el filtro de numero debe ser un numero mayor a 0 ' });
                return;
            } else {
                products = await Products.products.find({}).limit(numberParse).select('-__v');
            }
        } else {
            products = await Products.products.find({}).select('-__v');
        }
        res.json(products);
    
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta POST para agregar un producto al carrito
router.post('/:pid', authorizationMiddlewear('user'),async (req, res) => {
    try {
        const pid = parseInt(req.params.pid);
        const productToAdd = await Products.products.findOne({ id: pid });

        if (!productToAdd) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }

        let carrito;
        try {
            // Lee el carrito existente
            const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8');
            carrito = JSON.parse(carritoData);
        } catch (error) {
            console.error('No se pudo leer el archivo carrito.json o no existe, creando uno nuevo.', error);
            carrito = { products: [] };
        }
        carrito.id = 1;

        // Verificar si el carrito ya tiene productos
        if (!Array.isArray(carrito.products)) {
            carrito.products = [];
        }
        const existingProductIndex = carrito.products.findIndex(product => product.id === pid);

        if (existingProductIndex !== -1) {
            carrito.products[existingProductIndex].quantity += 1;
        } else {
            carrito.products.push({
                id: productToAdd.id,
                title: productToAdd.title,
                description: productToAdd.description,
                price: productToAdd.price,
                thumbnail: productToAdd.thumbnail,
                code: productToAdd.code,
                stock: productToAdd.stock,
                quantity: 1
            });
        }
        await fs.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));
        res.json({ status: 'success', carrito});

    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});



//Ruta GET x ID
router.get('/:cid', async (req,res)=>{
    const cid = parseInt(req.params.cid);
    const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8')
    const carrito = JSON.parse(carritoData);
    const prodFound = carrito.products.find(p=>p.id === cid)

    if(!prodFound){
        res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }else{
        res.json(prodFound)
    }
})


// Ruta POST para agregar mas de un producto al carrito
router.post('/:cid/product/:pid', authorizationMiddlewear('user') , async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8');
        const carrito = JSON.parse(carritoData);
        
        if (carrito.id !== parseInt(cid)) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        const productId = parseInt(pid);
        
        const product = await Products.products.findOne({ id: productId });

        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
        }
        
        const existingProductIndex = carrito.products.findIndex(prod => prod.id === productId);
        if (existingProductIndex !== -1) {
            carrito.products[existingProductIndex].quantity += 1;
        } else {
            // Agregar el producto al arreglo de productos del carrito con cantidad 1
            carrito.products.push({ 
                id: productId, 
                title: product.title,
                description: product.description,
                price: product.price,
                quantity: 1 
            });
        }
        
        await fs.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));
        res.json({ status: 'success', carrito });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
});

// Eliminar bucando en el carrito y por ID
router.delete('/:cid/product/:pid', async(req, res) => {
    try {
        const { cid, pid } = req.params;
        const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8')
        const carrito = JSON.parse(carritoData);
        if (carrito.id !== parseInt(cid)) {
            return res.status(404).json({ message: 'El carrito no fue encontrado' });
        }
        const index = carrito.products.findIndex(product => product.id === parseInt(pid));
        if (index === -1) {
            return res.status(404).json({ message: 'El producto no existe en el carrito' });
        }
        carrito.products.splice(index, 1);
        await fs.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2), 'utf-8');
        return res.status(200).json({ message: 'Producto eliminado del carrito exitosamente' });
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// eliminar todos los productos de carrito
router.delete('/:cid', async (req,res)=>{
    try{const cid = parseInt(req.params.cid)
        const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8')
    const carrito = JSON.parse(carritoData);
    if (carrito.id !== parseInt(cid)) {
        return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    }else{
        carrito.products =[];
        await fs.writeFile(`${__dirname}/../carrito.json`, JSON.stringify(carrito, null, 2), 'utf-8');
        return res.status(200).json({ message: 'Productos eliminados del carrito' });
    }}catch (error) {
        console.error('Error al eliminar Todos los productos del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

// Cambiar la quantity del producto
router.put('/:cid/product/:pid', async(req,res)=>{
    try{
        quantity = parseInt(req.query.quantity)
        const { cid, pid } = req.params;
        const carritoData = await fs.readFile(__dirname + '/../carrito.json', 'utf-8')
        const carrito = JSON.parse(carritoData);
        if (carrito.id !== parseInt(cid)) {
            return res.status(404).json({ message: 'El carrito no fue encontrado' });
        }const index = carrito.products.findIndex(product => product.id === parseInt(pid));
        if (index === -1) {
            return res.status(404).json({ message: 'El producto no existe en el carrito' });
        }
        if (quantity <= 0) {
            return res.status(400).json({ message: 'La cantidad debe ser mayor que cero' });
        }
            // Obtener el producto correspondiente al ID
            const product = await Products.products.findOne({ id: parseInt(pid) });
            // Verificar si el producto existe
            if (!product) {
                return res.status(404).json({ message: 'El producto no existe' });
            }
        if (quantity > product.stock) {
            return res.status(400).json({ message: 'La cantidad supera el stock del producto' });
        }

        carrito.products[index].quantity = quantity;
        await fs.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));
        res.json({ status: 'success', carrito });
    }catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

module.exports = router;
