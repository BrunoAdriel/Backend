const { Ticket, Product } = require('../dao')
const ticketModel = require('../models/ticket.model')

const carrito = require('../carrito.json');

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

    try{
        const totalPrice = carrito.products.reduce((acc, producto)=>{
            return acc + (producto.price * producto.quantity)
        }, 0)

        const currentDate = new Date()
        // console.log(currentDate)
    
    const ticketOrder = await TicketDAO.createTicket({
        Code: Math.floor(Math.random() * 101),
        Amount: totalPrice,
        Status: 'pending',
        Date: currentDate,
        // purchase: user.emial,
        Products: carrito.products,
    })
    const ticketModel = {
        Code: ticketOrder.Code,
        Amount: ticketOrder.Amount,
        Status: ticketOrder.Status,
        Date: currentDate,
        // Purchaser: ticketOrder.purchaser,
        Products: ticketOrder.Products
    };
    
    console.log(ticketModel); 
}    catch(err){
    console.error('Error al crear el Ticket:', err.message)
}
}
}

