// agregar alcarritocon el boton

document.addEventListener('DOMContentLoaded', () => {
    const btnAddToCart = document.querySelectorAll('#addToCartBtn');
    btnAddToCart.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.dataset.product;
            console.log('Botón de agregar al carrito clickeado. ID del producto:', productId);
            // Aquí puedes agregar el código para enviar la solicitud POST al servidor
            // Recuerda que productId es el ID del producto que necesitas enviar al servidor
        });
    });
});


// const btnAddToCart = document.querySelectorAll('#addToCartBtn').addEventListener('click', ()=> {
//     console.log(btnAddToCart)
// })


// document.addEventListener('DOMContentLoaded', () => {
//     const addToCartBtn = document.querySelectorAll('.addToCartBtn');
//     addToCartBtn.forEach(button => {
//         button.addEventListener('click', async (event) => {
//             const productId = event.target.dataset.product;
//             try {
//                 console.log('Botón de agregar al carrito clickeado. ID del producto:', productId);
//                 const response = await fetch(`/pagination/${productId}`, { method: 'POST' });
//                 const data = await response.json();
//                 if (data.success) {
//                     alert('Producto agregado al carrito correctamente');
//                 } else {
//                     alert('Error al agregar el producto al carrito');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//                 alert('Error al agregar producto mediante botón');
//             }
//         });
//     });
// });

//     res.status(500).json({error:message, message:'Error al agregar producto mediante btn'})
// router.post('/:id', async (req,res)=>{
//     try{
//         const manager = req.app.get('productManager')
//         await manager.getProductById(req.params.id)
//         await fs.promises.writeFile(__dirname + '/../carrito.json', JSON.stringify(carrito, null, 2));
//         res.status(200).json({success: true})
//     }catch(error){
//         return res.status(500).json({success:false})
//     }
// })



// function addProduct(prodId){
//     $.ajax(`/pagination/${prodId}`,{
//         dataType: 'json',
//         method: 'success',
//         success: function(){
//             $(`#item-prod-${prodId}`)
//         }
//     })
// }