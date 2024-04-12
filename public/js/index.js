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