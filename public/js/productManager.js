const fs = require('fs').promises;

class ProductManager {

    #products;
    #lastProductId;
    path;

    constructor(path) {
        this.#products = [];
        this.path = path;
        this.#lastProductId = 1;
        this.#readFile();
    }

    async #readFile() {
        try {
            const fileData = await fs.readFile(this.path, 'utf-8');
            this.#products = JSON.parse(fileData);
            this.#updateLastProductId();
        } catch (error) {
            await this.#saveFile();
        }
    }

    #updateLastProductId() {
        const lastProduct = this.#products[this.#products.length - 1];
        if (lastProduct) {
            this.#lastProductId = lastProduct.id + 1;
        }
    }

    async #saveFile() {
        await fs.writeFile(this.path, JSON.stringify(this.#products, null, 2), 'utf-8');
    }

    #getNewId() {
        return this.#lastProductId++;
    }

    async addProduct(title, description, price, thumbnail, code, stock) {
        if (!title || !description || !code) {
            throw new Error('Debe completar todos los campos');
        }

        if (!thumbnail) {
            thumbnail = 'Sin Imagen';
        } else {
            thumbnail;
        }

        const numericPrice = parseFloat(price)
        const numericStock = parseInt(stock)

        if (numericStock < 0 && numericPrice <= 0) {
            throw new Error('Asegúrese de que stock y price sean valores de tipo "number" superiores o iguales a 0');
        }

        const existingProduct = await this.getProducts();
        const findProductCode = existingProduct.find(field => field.code === code)

        if (!findProductCode) {
            const product = { id: this.#getNewId(), title, description, price: numericPrice, thumbnail, code, stock: numericStock };
            this.#products.push(product);
            await this.#saveFile();
            console.log('Agregado Correctamente');
        } else {
            throw new Error('El código de producto ya existe');
        }
    }

    async getProducts() {
        try {
            const fileContents = await fs.readFile(this.path, 'utf-8');
            const existingProduct = JSON.parse(fileContents);
            return existingProduct;
        } catch (err) {
            return [];
        }
    }

    async getProductById(id) {
        const existingProducts = await this.getProducts();
        const filterProductById = await existingProducts.find(el => el.id === id);
        if (filterProductById) {
            return await filterProductById;
        } else {
            throw new Error('Not Found: El ID solicitado no existe.');
        }
    }

    async updateProduct(id, updatedProduct) {
        const indexToUpdate = this.#products.findIndex(el => el.id === id);

        if (indexToUpdate !== -1) {
            const { id: updatedId, stock, price } = updatedProduct;

            if (stock <= 0 || price <= 0) {
                throw new Error('Asegúrese de que stock y price sean valores de tipo "number" superiores a 0');
            }

            if (updatedId && updatedId !== id) {
                throw new Error('No se permite modificar el ID del producto');
            }

            this.#products[indexToUpdate] = { ...this.#products[indexToUpdate], ...updatedProduct, id };
            await this.#saveFile();
            console.log('Producto actualizado correctamente');
        } else {
            throw new Error('Not found: El ID solicitado no existe');
        }
    }

    async deleteProduct(id) {
        const indexToDelete = this.#products.findIndex(el => el.id === id);
        if (indexToDelete !== -1) {
            this.#products.splice(indexToDelete, 1);
            await this.#saveFile();
            console.log('Producto eliminado correctamente');
        } else {
            throw new Error('Not found: El ID solicitado no existe');
        }
    }
}

module.exports = ProductManager;
