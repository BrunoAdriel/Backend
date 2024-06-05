const TicketModel = require('../../models/ticket.model')


class TicketDAO{

    async getTicket(){
        try{
            const ticket = await TicketModel.find()
            return ticket.map(e => e.toObject())
        }catch(err){
            console.error(err)
            return null
        }
    }

    async getTicketById(id){
        try{
            const ticket = await TicketModel.findById(id)
            return ticket?.toObject() ?? false
        }catch(err){
            console.error(err)
            return null
        }
    }
    
    async createTicket(ticket){
        try{
            const savedTicket = await TicketModel.create(ticket)
            return savedTicket.toObject()
        }catch(err){
            console.error(err)
            return null
        }
    }
    
    async resolveTicket(id, status){
        try{
            const result = await TicketModel.updateOne({_id: id}, {$set: { status }})
            return result
        }catch(err){
            console.error(err)
            return null
        }
    }
}

module.exports = {TicketDAO}