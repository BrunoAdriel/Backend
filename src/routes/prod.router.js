const { Router } = require('express');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');  //utilizo la biblioteca "uuid" para poder generar el id
const ProductManager = require('../../public/js/productManager')


const router = Router();

const manager = new ProductManager(`${__dirname}/../FileProducts.json`)

let carrito = []
router.get('/', async (req, res)=>{
    try{
        const prodFilter = req.query.prodFilter
        const products =  await manager.getProducts()
        if(prodFilter){
            const numberParse = parseInt(prodFilter, 10)
            if(numberParse <= 0 || isNaN(numberParse)|| !prodFilter){
                numberParse = 10;
                res.status(404).json({ message: 'Error el filtro de numero debe ser un numero mayor a 0 '})
            }else{
                const prodLimited = products.slice(0, numberParse)
                res.json(prodLimited)
            }
        }else{ res.json(products) }
    }catch{
        res.status(500).json({error:message, message:'Error al cargar los productos con el filtro numerico'})
    }
})

router.get('/:pid', async (req,res)=>{
    const prodId = parseInt(req.params.pid)
    const prod = manager.getProductById(prodId)
    try{
        return res.status(200).json(prod)
    }catch(error){
        res.status(500).json({error: error.message, message:'Error al buscar producto por ID' })
    }
})


router.post('/', async (req, res)=>{
    try{

    }catch{

    }
})



router.delete('/:pid', async(req, res)=>{
    const prodId = parseInt(req.params.pid)
    const prod = manager.deleteProduct(prodId)
    try{
        return res.status(200).json({message: 'Se elimino correctamente el producto'})
    }catch(error){
        res.status(500).json({error: error.message, message:'Error al eliminar producto'})
    }
})
// router.post('/', async (req, res) => {
// try {
//     const data = await fs.promises.readFile(__dirname + '../../FileProducts.json', 'utf-8');
//     const products = JSON.parse(data);
//     const { productId, quantity } = req.body;

//     // Busca el producto solicitado
//     const productToAdd = products.find(product => product.id === productId);
//     if (!productToAdd) {
//         return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
//     }

//     let carrito;
//     try {
//       // Lee el carrito existente
//         const carritoData = await fs.promises.readFile(__dirname + '/../carrito.json', 'utf-8');

//         carrito = JSON.parse(carritoData);
//         const carritoId = uuidv4();
//         carrito = {
//         id: carritoId,
//         products: []
//     };
//     } catch (error) {
//         console.error('No se pudo leer el archivo carrito.json o no existe, creando uno nuevo.', error);
//     }

//     // Verificar si el carrito ya tiene productos
//     if (!Array.isArray(carrito.products)) {
//       // Si carrito.products no es un array, inicialízalo como un array vacío
//     carrito.products = [];
//     }
//     // Verifica si el producto ya existe en el carrito
//     const existingProductIndex = carrito.products.findIndex(product => product.id === productId);

//     if (existingProductIndex !== -1) {
//       // Si el producto ya existe, actualizar la cantidad
//     carrito.products[existingProductIndex].quantity += quantity;
//     } else {
//     carrito.products.push({
//         ...productToAdd,
//         quantity
//     });
//     }

//     await fs.promises.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));

//     // Responder con el carrito actualizado
//     res.json({ status: 'success', carrito}); //El id lo agrego aca ya que en el parametro del carrito no me lo agrega, json no llega :'(
// } catch (error) {
//     console.error('Error al agregar producto al carrito:', error);
//     res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
// }
// });


//Ruta GET x ID
// router.get('/:cid', async (req,res)=>{
//     const cid = parseInt(req.params.cid);
//     const carritoData = await fs.promises.readFile(__dirname + '/../carrito.json', 'utf-8');
//     const carrito = JSON.parse(carritoData);
    
//     const prodFound = carrito.products.find(p=>p.id === cid)

//     if(!prodFound){
//         res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
//     }else{
//         res.json(prodFound)
//     }
// })


// Ruta POST para agregar un producto al carrito
// router.post('/:cid/product/:pid', async (req, res) => {
//     try {
//     // Obtener el ID del carrito y del producto desde los parámetros de la solicitud
//     const { cid, pid } = req.params;

//     // Leer el archivo del carrito
//     const carritoData = await fs.promises.readFile(__dirname + '/../carrito.json', 'utf-8');
//     let carrito = JSON.parse(carritoData);
//     let carritoIndex;

//     // Buscar el carrito con el ID especificado
//     if (carrito.id === cid) {
//         carritoIndex = 0;
//     } else {
//         return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
//     }

//     // Obtener el producto con el ID especificado
//     const product = {
//     id: pid,
//       quantity: 1 // Se agrega un solo producto por vez
//     };

//     // Agregar el producto al arreglo "products" del carrito
//     if (carrito.products) {
//         carrito.products.push(product);
//     } else {
//         carrito.products = [product];
//     }

//     // Guardar el carrito actualizado en el archivo
//     await fs.promises.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));

//     // Responder con el carrito actualizado
//     res.json({ status: 'success', carrito });
// } catch (error) {
//         console.error('Error al agregar producto al carrito:', error);
//         res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
//     }
// });


module.exports = router;
