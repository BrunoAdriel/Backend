const { Ticket, Product } = require('../dao')
const ticketModel = require('../models/ticket.model')
const carrito = require('../carrito.json')
const passportMiddlwear = require('../utils/passport.middlewar')

const { v4: uuidv4 } = require('uuid');

const ProductDAO = new Product()
const TicketDAO = new Ticket()

module.exports = {

    getTicket: async (_, res) => {
        const ticket = await TicketDAO.getTicket()
        if(!ticket){
            return res.sendError('Something went wrong!')
        }res.sendSuccess(ticket)
    },

    getTicketById: async(req,res) => {
        try{
            const id = req.params.id
            const ticket = await TicketDAO.findTicketById(id)
            if(!ticket){
                return ticket === false
                ? res.sendError ({ message:'Not Found!'}, 404)
                : res.sendError ({ message:'Something went wrong!'})
            }
            res.sendSuccess(ticket)
        }catch(err){
            console.error(err)
            return null
        }
    },

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
                    Code: ticketOrder.Code,
                    Amount: ticketOrder.Amount,
                    Status: ticketOrder.Status,
                    Date: currentDate,
                    Purchaser: userEmail, 
                    Products: ticketOrder.Products
                };
                
                console.log(ticketModel); 
                res.json({ status: 'success', ticketModel })
            });
}    catch(err){
    console.error('Error al crear el Ticket:', err.message)
}
}
}

