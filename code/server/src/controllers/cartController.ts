import { User } from "../components/user";
import { Product } from "../components/product";
import Cart from "../components/cart";
import CartDAO from "../dao/cartDAO";

/**
 * Represents a controller for managing shopping carts.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class CartController {
    private dao: CartDAO

    constructor() {
        this.dao = new CartDAO
    }

    /**
     * Retrieves the cart for a specific user.
     * @param user - The user for whom to retrieve the cart.
     * @returns A Promise that resolves to the user's cart or `false` if the cart doesn't exist.
     */
    async getCart(user: User) {
    }

    /**
     * Adds a product to the user's cart.
     * @param user - The user to whom the product should be added.
     * @param productId - The ID of the product to add.
     * @returns A Promise that resolves to `true` if the product was successfully added.
     */
    async addToCart(user: User, productId: string) { }

    /**
     * Checks out the user's cart.
     * @param user - The user whose cart should be checked out.
     * @returns A Promise that resolves to `true` if the cart was successfully checked out.
     * All products that are in the cart must have their selling date set to the current date (in format YYYY-MM-DD).
     */
    async checkoutCart(user: User) { }

    /**
     * Retrieves all carts for a specific customer.
     * @param user - The customer for whom to retrieve the carts.
     * @returns A Promise that resolves to an array of carts belonging to the customer.
     * Only the carts that have been checked out should be returned, the current cart should not be included in the result.
     */
    async getCustomerCarts(user: User) { }

    /**
     * Removes a product from the user's cart.
     * @param user - The user from whom to remove the product.
     * @param productId - The ID of the product to remove.
     * @param cartId - The ID of the cart from which to remove the product.
     * @returns A Promise that resolves to `true` if the product was successfully removed.
     */
    async removeFromCart(user: User, productId: string, cartId: number) { }


    /**
     * Deletes a specific cart.
     * @param user - The user who owns the cart.
     * @param cartId - The ID of the cart to delete.
     * @returns A Promise that resolves to `true` if the cart was successfully deleted.
     */
    async deleteCart(user: User, cartId: number) { }

    /**
     * Deletes all carts.
     * @returns A Promise that resolves to `true` if all carts were successfully deleted.
     */
    async deleteAllCarts() { }
}

export default CartController