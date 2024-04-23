const socket = io()

socket.on('newProduct', (product)=>{
    // agregar el nuevo prod al html
    const container = document.getElementById('prodsFeed')

    container.innerHTML += `
    <div>
    <h3>${product.title}</h3>
    <img src="${product.thumbnail}" alt="${product.title}" />
        <section>
            <p>${product.descripcion}</p>
            <p>$ ${product.price}</p>
            <p>Stock disponible: ${product.stock}</p>
            <p>Codigo del producto: ${product.code}</p>
        </section>
</div>`
})