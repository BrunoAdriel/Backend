const { Ticket, Product } = require('../dao')
const ticketModel = require('../models/ticket.model')
const carrito = require('../carrito.json')
const passportMiddlwear = require('../utils/passport.middlewar')
const { v4: uuidv4 } = require('uuid');
const TicketDAO = new Ticket()

module.exports = {

    createTicket: async (req, res) => { 
        try {
            // Middleware para obligar a autenticar y obtener el email
            await passportMiddlwear('local')(req, res, async () => {
                
                const totalPrice = carrito.products.reduce((acc, producto) => {
                    return acc + (producto.price * producto.quantity);
                }, 0);

                const currentDate = new Date();
                // manejo del email para que si no esta registrado lo redireccione y para poder devolver el ticket
                const userEmail = req.user ? req.user.email : null;
                if (!userEmail) {
                    return res.redirect('/login')
                }

                // Code unico y autogenerado
                const ticketCode = uuidv4();

                // Crear el ticket 
                const ticketOrder = await TicketDAO.createTicket({

                    Code: ticketCode,
                    Amount: totalPrice,
                    Status: 'pending',
                    Date: currentDate,
                    Purchaser: userEmail, 
                    Products: carrito.products,
                });

                // Pasaje y guardado de datos
                const ticketModel = {
                    id: ticketOrder._id,
                    Code: ticketOrder.Code,
                    Amount: ticketOrder.Amount,
                    Status: ticketOrder.Status,
                    Date: currentDate,
                    Purchaser: userEmail, 
                    Products: ticketOrder.Products
                };
                res.json({ status: 'success', ticketModel })
                
            });
        }catch(err){
            console.error('Error al crear el Ticket:', err.message)
        }
},
resolveTicket : async (req, res) => {
    try {
        const ticketId = req.body.id; 
        const ticket = await TicketDAO.getTicketById(ticketId);
        if (!ticket) {
            return res.status(404).json({ status: 'error', message: 'Ticket not found!' });
        }

        let notInStock = [];
        let quantityProds = [];
        let negativeQuantity = [];
        for(const prods of carrito.products){
            if( prods.stock < prods.quantity){
                notInStock.push({
                        productId: prods.id,
                        productName: prods.name,
                        stockDisponible: prods.stock,
                        stockSolicitado: prods.quantity
                        })
                }
            if (prods.quantity === 0 ){
                quantityProds.push({
                    productId: prods.id,                        
                    productName: prods.name,
                    stockDisponible: prods.stock,
                    stockSolicitado: prods.quantity
                    })
            }
            if(prods.quantity < 0 ){
                negativeQuantity.push({
                    productId: prods.id,
                    productName: prods.name,
                    stockDisponible: prods.stock,
                    stockSolicitado: prods.quantity
                    })
            }
    }
        if(notInStock.length > 0 || quantityProds.length > 0 || negativeQuantity.length > 0){
            ticketModel.status = 'Cancelado!'
            let errorMessage = 'Stock insuficiente para tu pedido'
            if(quantityProds.length > 0){
                errorMessage +='/ Productos con cantidad cero:'
                quantityProds.forEach(e=> errorMessage += `${e.productName}`)
            }
            if(negativeQuantity.length > 0){
                errorMessage += '/ Productos con cantidad negativa:'
            }
            return res.json({ status: 'error/cancelado', message: errorMessage, notInStock, quantityProds, negativeQuantity})
        }
        res.json({ status:'Aprobado!', ticket })
    
    } catch (err) {
        console.error('Error al resolver el Ticket:', err.message);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
}

