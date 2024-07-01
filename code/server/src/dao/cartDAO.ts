import { Cart, ProductInCart } from "../components/cart";
import { EmptyProductStockError, LowProductStockError, ProductNotFoundError } from "../errors/productError";
import { CartNotFoundError } from "../errors/cartError";
import db from "../db/db";
import dayjs from "dayjs";
import ProductDAO from "./productDAO";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */

class CartDAO {
    /**
     * Retrieves the current cart for a given user.
     * @param userId The ID of the user whose cart is to be retrieved.
     * @returns A promise that resolves to the user's current cart.
    */    
    getCart(userId: string): Promise<Cart> {
        return new Promise<Cart>((resolve, reject) => {
            try {
                const query = `SELECT customer, paid, payment_date, total
                               FROM carts
                               WHERE paid = false AND customer=? AND total > 0`;
                db.get(query, [userId], (err: Error | null, row: any) => {
                    if (err)
                        reject(err)
                    else {
                        var cart_tmp: Cart;
                        if (row)
                            cart_tmp = new Cart(row.customer, row.paid ? true : false, row.payment_date, row.total, []);
                        else
                        cart_tmp = new Cart(userId, false, null, 0, []);
                        resolve(cart_tmp);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Fetches the cart history for a specific user.
     * @param userId The ID of the user whose cart history is to be retrieved.
     * @returns A promise that resolves to an array of the user's past carts.
    */
    getCostumerCarts(userId: string): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            try {
                const query = 'SELECT * FROM carts WHERE paid = true AND customer=?';
                db.all(query, [userId], (err: Error | null, rows: any[]) => {
                    if (err)
                        reject(err);
                    else {
                       if (rows.length === 0)
                            resolve([])
                        else {
                            const carts: Cart[] = rows.map(row => new Cart(row.customer, row.paid ? true : false, row.payment_date = dayjs(row.payment_date).format("YYYY-MM-DD"), row.total, []));
                            resolve(carts);
                        }
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Fetches the identifier of a specific cart belonging to a given user.
     * @param userId The unique identifier of the user.
     * @param b Boolean indicating the payment status of the cart.
     * @returns A promise that resolves to the cart's ID if found, or null if not found.
    */
    getCartId(userId: string, b: boolean): Promise<number | null> {
        return new Promise<number>((resolve, reject) => {
            try {
                const query = 'SELECT * FROM carts WHERE paid = ? AND customer = ?';
                db.get(query, [b, userId], (err: Error | null, row: any) => {
                    if (err)
                        reject(err);
                    if (!row)
                        resolve(null);
                    else
                        resolve(row.id);
                }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Obtains the IDs of all carts for a user based on payment status.
     * @param userId The user's unique identifier.
     * @param b Boolean indicating the payment status of the carts.
     * @returns A promise that resolves to an array of cart IDs.
    */
    getCartsIds(userId: string, b: boolean): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            try {
                const query = 'SELECT id FROM carts WHERE paid = ? AND customer = ?';
                db.all(query, [b, userId], (err: Error | null, rows: any[]) => {
                    if (err)
                        reject(err);
                    else {
                        const cartIds: number[] = rows.map(row => row.id);
                        resolve(cartIds);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves all shopping carts from the database.
     * @returns A promise that resolves to an array of Cart objects.
    */
    getAllCarts(): Promise<Cart[]> {
        return new Promise<Cart[]>((resolve, reject) => {
            const query = 'SELECT * FROM carts';
            db.all(query, [], (err: Error | null, rows: any[]) => {
                if (err)
                    reject(err);
                else {
                    const carts: Cart[] = rows.map(row => new Cart(row.customer, row.paid ? true : false, row.payment_date, row.total, []));
                    resolve(carts);
                }
            });
        });
    }

    /**
     * Fetches the IDs of all shopping carts in the database.
     * @returns A promise that resolves to an array of cart IDs.
    */
    getAllCartsIds(): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            try {
                const query = 'SELECT id FROM carts';
                db.all(query, [], (err: Error | null, rows: any[]) => {
                    if (err)
                        reject(err);
                    else {
                        const cartIds: number[] = rows.map(row => row.id);
                        resolve(cartIds);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Retrieves products contained in a specific cart.
     * @param cartId The unique identifier of the cart.
     * @returns A promise that resolves to an array of products in the cart.
    */
    getProductsInCart(cartId: number): Promise<ProductInCart[]> {
        return new Promise<ProductInCart[]>((resolve, reject) => {
            try {
                const sqlQuery = `SELECT model, quantInCart AS quantity, category, selling_price AS price
                                FROM products
                                JOIN (SELECT product_model, cart_id, quantity AS quantInCart
                                      FROM products_in_carts
                                      WHERE cart_id = ?)
                                WHERE product_model = model`
                db.all(sqlQuery, [cartId], (error: Error | null, rows: ProductInCart[]) => {
                    if (error) {
                        reject(error)
                    } else {
                        const products: ProductInCart[] = rows.map(row => new ProductInCart(row.model, row.quantity, row.category, row.price));
                        resolve(products);
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Deletes all carts from the database.
     * @returns A promise that resolves to true if carts were deleted, false otherwise.
    */
    deleteAllCarts(): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            try {
                const query = 'DELETE FROM Carts';
                db.run(query, [], function (err: Error) { 
                    if (err)
                        reject(err)
                    else {
                        const result = this.changes;
                        if (result)
                            resolve(true);
                        else
                            resolve(false);
                    }
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Clears all products from a specific cart without devaring the cart itself.
     * @param cartId The unique identifier of the cart to be cleared.
     * @returns A promise that resolves to true if the cart was cleared, or rejects with an error if the cart does not exist.
    */
    clearCart(cartId: number): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            try {
                const query = `UPDATE carts SET total = 0 WHERE id = ?`;
                db.run(query, [cartId], function (err: Error) {
                    if (err)
                        reject(err);
                    else {
                        const result = this.changes;
                        if (result)
                            resolve(true);
                        else
                            reject(new CartNotFoundError());
                    }
                })
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Removes products from a specified cart.
     * @param cartId The unique identifier of the cart.
     * @returns A promise that resolves when the operation is compvare.
    */
    delProdsFromCart(cartId: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const query = `DELETE FROM products_in_carts WHERE cart_id = ?`;
                db.run(query, [cartId], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve();
                })
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Removes a single product from the current cart.
     * @param cartId The unique identifier of the cart.
     * @param model The model of the product to be removed.
     * @param b A flag indicating whether to remove one instance of the product or all instances.
     * @returns A promise that resolves when the product is removed.
    */
    async removeProductFromCart(cartId: number, model: string, b: number): Promise<void> {
        try {
            const productDAO = new ProductDAO();
            const productDetails = await productDAO.getProduct(model);
    
            if (!productDetails) {
                throw new ProductNotFoundError();
            }
    
            var query: string;
            if (b === 1) {
                query = `DELETE FROM products_in_carts WHERE cart_id = ? AND product_model = ?`;
            } else {
                query = `UPDATE products_in_carts SET quantity = quantity - 1 WHERE cart_id = ? AND product_model = ?`;
            }
    
            await new Promise<void>((resolve, reject) => {
                db.run(query, [cartId, model], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
    
            await productDAO.changeProductQuantity(model, productDetails.quantity + 1);
        } catch (error) {
            throw error;
        }
    }
    

    /**
     * Checks if a product exists in the database.
     * @param model The model identifier of the product.
     * @returns A promise that resolves to the selling price of the product if it exists, or rejects with an error if it does not.
    */
    productExists(model: string): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            try {
                const query = 'SELECT * FROM products WHERE model = ?';
                db.get(query, [model], function (err: Error | null, row: any) {
                    if (err)
                        reject(err)
                    if (!row) 
                        reject(new ProductNotFoundError());
                    else
                        resolve(row.selling_price)
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Determines if a product is already in the cart.
     * @param cartId The unique identifier of the cart.
     * @param model The model of the product.
     * @returns A promise that resolves to the quantity of the product in the cart, or null if it is not in the cart.
    */
    alreadyInCart(cartId: number, model: string): Promise<number | null> { 
        return new Promise<number>((resolve, reject) => {
            try {
                const query = `SELECT * FROM products_in_carts WHERE product_model = ? AND cart_id = ?`;
                db.get(query, [model, cartId], (err: Error | null, row: any) => {
                    if (err)
                        reject(err)
                    else {
                        resolve(row ? row.quantity : null)
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Determines if a cart is empty or not.
     * @param cartId The cart's unique identifier.
     * @returns A promise that resolves to true if the cart is empty, false otherwise.
    */
    cartIsEmpty(cartId: number): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const query = `SELECT * FROM carts WHERE id = ? AND paid = false AND total > 0`;
                db.get(query, [cartId], (err: Error | null, row: any) => {
                    if (err)
                        reject(err)
                    if (!row)
                        resolve(true)
                    else
                        resolve(false)
                })
            } catch (error) {
                reject(error)
            }
        })
    }

   /**
     * Adds a product to the cart or increases its quantity if it already exists.
     * @param product The product model to add.
     * @param cartId The identifier of the cart to which the product is added.
     * @param bool Indicates whether the product is already in the cart.
     * @returns A promise that resolves when the operation is compvare.
    */
   async addToCart(product: string, cartId: number, bool: boolean): Promise<void> {
        try {
            
            const productDAO = new ProductDAO();
            //const productDetails1 = await productDAO.getProduct(product);

            const productDetails = await productDAO.getProducts(product);

            if (!productDetails) {
                throw new ProductNotFoundError();
            }
    
            for (const productDetail of productDetails) {
                if (productDetail.quantity <= 0) {
                    throw new EmptyProductStockError();
                }
            }

            try {
                var query: string;
                if (!bool) {
                    query = 'INSERT INTO products_in_carts (product_model, cart_id, quantity) VALUES (?, ?, 1)';
                } else {
                    query = 'UPDATE products_in_carts SET quantity = quantity + 1 WHERE product_model = ? AND cart_id = ?';
                }

                await new Promise<void>((resolve, reject) => {
                    db.run(query, [product, cartId], function (err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                await productDAO.changeProductQuantity(product, -1); 
            } catch (error) {
                throw error;
            }
        }  
        catch (error) {
            throw error;
        }
    }


    /**
     * Creates a new shopping cart for a user.
     * @param userId The user's identifier.
     * @returns A promise that resolves once the cart is created.
    */
    newCart(userId: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const query = 'INSERT INTO carts (customer, paid, payment_date, total) VALUES (?, ?, ?, ?)';
                db.run(query, [userId, false, null, 0], function (err) {
                    if (err)
                        reject(err)
                    else
                        resolve()
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Updates the total price of a cart.
     * @param cartId The identifier of the cart to update.
     * @param price The amount to add to the cart's total.
     * @returns A promise that resolves once the cart's total is updated.
    */
    updateTotal(cartId: number, price: number): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                const query = 'UPDATE carts SET total = total+? WHERE id = ?';
                db.run(query, [price, cartId], function (err) {
                    if (err)
                        reject(err)
                    else
                        resolve()
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Checks the stock quantity against the quantity in the cart for all products in a cart.
     * @param cartId The cart's identifier.
     * @returns A promise that resolves to an array of differences between stock and cart quantities for each product.
    */
    checkQuantity(cartId: number): Promise<number[]> {
        return new Promise<number[]>((resolve, reject) => {
            try {
                const query = `SELECT products.quantity AS quantityInStock,
                                      products_in_carts. quantity AS quantityInCart
                                FROM products
                                JOIN products_in_carts
                                WHERE products.model = products_in_carts.product_model
                                AND cart_id = ?`
                db.all(query, [cartId], (err: Error | null, rows: any[]) => {
                    if (err)
                        reject(err)

                    var products = [];
                    for (var i = 0; i < rows.length; i++) {
                        var row = rows[i];
                        var qs = row.quantityInStock;
                        var qc = row.quantityInCart;
                        if (qs === 0)
                            reject(new EmptyProductStockError())
                        else if (qs < qc)
                            reject(new LowProductStockError());
                        products[i] = qs - qc;
                    }
                    resolve(products)
                });
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Marks a cart as paid.
     * @param cartId The identifier of the cart to update.
     * @returns A promise that resolves once the cart is marked as paid.
    */
    async setAsPaid(cartId: number): Promise<void> {
        try {
            const date = dayjs().format('YYYY-MM-DD').toString();
            const query = `UPDATE carts SET paid = true, payment_date = ? WHERE id = ?`;
    
            await new Promise<void>((resolve, reject) => {
                db.run(query, [date, cartId], function (err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
    
            const productsInCart = await this.getProductsInCart(cartId);
            const productDAO = new ProductDAO();
    
            for (const product of productsInCart) {
                await productDAO.changeProductQuantity(product.model, product.quantity - product.quantity);
            }
        } catch (error) {
            throw error;
        }
    }
    
}

export default CartDAO