// JS del lado del Browser

const socket = io()

document.querySelector('#sendMessage').addEventListener('click', () =>{
    const message = document.querySelector('#inputMessage').value

    socket.emit('new-message', message) //enviando mensaje al servidor
})

socket.on('message',(event)=>{
    const paragraph = document.createElement('p')
    paragraph.innerText =`${event.id}: ${event.text}`

    document.querySelector('#chatBox').appendChild(paragraph)
})

$('#filtros_products').submit(function(e){
    e.preventDeFault()

    const formValues = $(this).serializeArray()

    const requestBody =Object.fromEntries(
        formValues.map(fv=>[fv.name, fv.value])
    )

    $.getJSON('/pagination', requestBody, function(data){
    // Renderizar usuarios
        $('#prods_list ul')
            .html(
                data.map(u=>`
                <li id="item-prod-${u.id}">
                    ${u.title}, ${u.description}, ${u.price} y ${u.stock}
                    <a href='#' onclick="addProduct('${u.id}')">Eliminar</a>
                </li>
                `).join('')
            )
    })
})

function addProduct(prodId){
    $.ajax(`/pagination/${prodId}`,{
        dataType: 'json',
        method: 'success',
        success: function(){
            $(`#item-prod-${prodId}`)
        }
    })
}