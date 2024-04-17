

document.addEventListener('DOMContentLoaded', () => {
    const btnAddToCart = document.querySelectorAll('#addToCartBtn');
    btnAddToCart.forEach(button => {
        button.addEventListener('click', async () => {
            try {
                const productId = button.dataset.productId;
                const response = await fetch(`/api/carts/`);
                const data = await response.json();
                
                let productFound = false;
                data.forEach(product => {
                    if (product._id === productId) {
                        productFound = true;
                        fetch(`/api/carts/${product.id}`, { method: 'POST' })
                        // codigo para que no me devuelva por consola, el error porque solo paso un producto y los demas no
                            .then(response => {
                                if (response.ok) {
                                    alert('Producto agregado al carrito correctamente');
                                } else {
                                    throw new Error('Error al agregar producto al carrito');
                                }
                            })
                            .catch(error => {
                                console.error(error);
                                alert('Error al agregar producto al carrito');
                            });
                    }
                });
                if (!productFound) {
                    console.log('El producto no se encontró en la respuesta.');
                }
            } catch (error) {
                console.error('Error al agregar producto al carrito:', error);
                alert('Error al agregar producto al carrito');
            }
        });
    });
});

