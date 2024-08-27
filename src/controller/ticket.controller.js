const { Ticket, Product } = require('../dao')
const ticketModel = require('../models/ticket.model')
const carrito = require('../carrito.json')
const passportMiddlwear = require('../utils/passport.middlewar')
const Order = require('../models/order.model');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const TicketDAO = new Ticket()
const nodemailer = require('nodemailer')
const transport = require('../trasportMail/trasportMail')

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
                res.json({ status: 'success', ticketId: ticketOrder._id, ticketModel  })
                
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
                        productName: prods.title,
                        stockDisponible: prods.stock,
                        stockSolicitado: prods.quantity
                        })
                }
            if (prods.quantity === 0 ){
                quantityProds.push({
                    productId: prods.id,                        
                    productName: prods.title,
                    stockDisponible: prods.stock,
                    stockSolicitado: prods.quantity
                    })
            }
            if(prods.quantity < 0 ){
                negativeQuantity.push({
                    productId: prods.id,
                    productName: prods.title,
                    stockDisponible: prods.stock,
                    stockSolicitado: prods.quantity
                    })
            }
    }
        if(notInStock.length > 0 || quantityProds.length > 0 || negativeQuantity.length > 0){
            ticketModel.status = 'Cancelado!'
            let errorMessage = 'Stock insuficiente para tu pedido'
            if (quantityProds.length > 0) {
                errorMessage += ' / Productos con cantidad cero:';
                quantityProds.forEach(prod => {
                    errorMessage += ` ${prod.productName}`;
                });
            }
            if (negativeQuantity.length > 0) {
                errorMessage += ' / Productos con cantidad negativa:';
                negativeQuantity.forEach(prod => {
                    errorMessage += ` ${prod.productName}`;
                });
            }

            return res.json({ status: 'error/cancelado', message: errorMessage});
        }

        // Si todo está en orden, guarda el pedido en la base de datos
        const order = new Order({
            ticketId: ticket._id,
            userId: req.user._id, 
            products: carrito.products.map(prod => ({
                productId: prod.id, 
                productName: prod.title,
                quantity: prod.quantity,
                price: prod.price
            })),
            status: 'Aprobado'
        });

        await order.save();

        // Envio de mail
        const mailOptions = {
            from: process.env.GMAIL_ACCOUNT,
            to: req.user.email,
            subject: 'Confirmación de Pedido',
            html: `
            <p>Hola ${req.user.email},</p>
            <p>Tu pedido ha sido aprobado.</p>
            <p>Código de Ticket:${ticket._id}</p>
            <p>Productos comprados</p>
                <ul>
                    ${carrito.products.map(prod => `
                    <li>
                        <strong>Producto:</strong> ${prod.title}<br>
                        <strong>Cantidad:</strong> ${prod.quantity}<br>
                        <strong>Precio:</strong> ${prod.price}
                        </li>
                    `).join('')}
                </ul>
            <p>gracias por su compra!</p>
            `
        };
        
        // Vaciar el carrito
        carrito.products = []; 

        res.json({ status: 'Aprobado!', ticket });
    
    } catch (err) {
        console.error('Error al resolver el Ticket:', err.message);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
}
}

