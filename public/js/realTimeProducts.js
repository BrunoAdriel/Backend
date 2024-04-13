const socket = io();

socket.on('newProduct', (product)=>{
    // agregar el nuevo prod al html
    const container = document.getElementById('prodsFeed')

    container.innerHTML += `
    <div>
    <h3>${title}</h3>
    <img src="${thumbnail}" alt="${title}" />
        <section>
            <p>${descripcion}</p>
            <p>$ ${price}</p>
            <p>Stock disponible: ${stock}</p>
            <p>Codigo del producto: ${code}</p>
        </section>
</div>`
})