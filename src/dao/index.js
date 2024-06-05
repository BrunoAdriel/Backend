const { Product } = require("../models/products.model");
const { TicketDAO } = require("./ticket/ticket.dao");

module.exports = {
    Ticket : TicketDAO,
    Product  : Product
}