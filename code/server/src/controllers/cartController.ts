import { User } from "../components/user";
import { Cart } from "../components/cart";
import CartDAO from "../dao/cartDAO";
import ProductDAO from "../dao/productDAO";
import { EmptyProductStockError, ProductNotFoundError } from "../errors/productError";
import { CartNotFoundError, EmptyCartError, ProductNotInCartError } from "../errors/cartError";

/**
 * Manages shopping cart operations, interfacing with DAO classes for data persistence.
 */
class CartController {
    private dao: CartDAO
    private ProductDAO: ProductDAO

    /**  
     * Initializes DAOs for cart and product operations.
    */
    constructor() {
        this.dao = new CartDAO
        this.ProductDAO = new ProductDAO
    }

    /**
     * Adds a product to a user's cart, creating a new cart if necessary.
     * @param user - The user performing the add operation.
     * @param productId - The identifier of the product to be added.
     * @returns A promise resolving to true upon successful addition.
     */
    async addToCart(user: User, product: string): Promise<Boolean> {
        try{
            const prod = await this.ProductDAO.getProduct(product);
            if(!prod)                                                   //  Current Prdoduct does not exist
                return Promise.reject(new ProductNotFoundError());  
                                                                                     
            if(prod.quantity===0)                                       //  Current product eist but is not available 
                return Promise.reject(new EmptyProductStockError()); 

            let cartId = await this.dao.getCartId(user.username, false);
            let b = true;
            if(cartId===null){                                          //  Current cart does not exist
                await this.dao.newCart(user.username);
                cartId = await this.dao.getCartId(user.username, false);
                b = false;                                                  
            }
            else{
                const quantInCart = await this.dao.alreadyInCart(cartId, product);
                if(quantInCart===null)                                  //  Current cart exists but has no prods
                    b = false;
            }
            await this.dao.addToCart(product, cartId, b);
            await this.dao.updateTotal(cartId, prod.sellingPrice);
            return Promise.resolve(true);
        }catch(err){
            return Promise.reject(err);
        }
    }

    /**
     * Fetches the current cart for a given user.
     * @param user - The user whose cart is to be retrieved.
     * @returns A promise resolving to the user's current cart.
     */
    async getCart(user: User): Promise<Cart> {

        var cart = await this.dao.getCart(user.username);
        if(cart.total > 0){
            const cartId = await this.dao.getCartId(user.username, false);
            cart.products = await this.dao.getProductsInCart(cartId);
        }
        return Promise.resolve(cart);
     
    }

    /**
     * Finalizes the user's cart, marking it as paid.
     * @param user - The user completing the purchase.
     * @returns A promise resolving to true upon successful checkout.
     */
    async checkoutCart(user: User): Promise<Boolean> {
        try{
            //controllo sui carrelli
            const cartId = await this.dao.getCartId(user.username, false);
            if(!cartId)
                return Promise.reject(new CartNotFoundError());
            
            var cart = await this.dao.getCart(user.username);
            if(cart.total===0){
                return Promise.reject(new EmptyCartError());                        //  Error nothing in cart to checkout
            }
            cart.products = await this.dao.getProductsInCart(cartId);               
            const newQuantity: number[] = await this.dao.checkQuantity(cartId); 
            if(newQuantity){
                for(let i=0; i<cart.products.length; i++)
                    this.ProductDAO.changeProductQuantity(cart.products[i].model, newQuantity[i]);
                await this.dao.setAsPaid(cartId); 
                return Promise.resolve(true);  
            }
        } catch(err){
            return Promise.reject(err);
        } 
    }
   /**
     * Retrieves all checked-out carts for a given customer.
     * @param user - The customer whose carts are to be fetched.
     * @returns A promise resolving to an array of the customer's paid carts.
     */
    async getCustomerCarts(user: User): Promise<Cart[]> {
        try{
            var cart: Cart[] = await this.dao.getCostumerCarts(user.username);      
            const cartId: number[] = await this.dao.getCartsIds(user.username, true); 
                for(var i=0; i<cart.length; i++){
                    cart[i].products = await this.dao.getProductsInCart(cartId[i]);
                }              
            return Promise.resolve(cart);
        }catch(error){
            return Promise.reject(error)
        } 
    } 

    /**
     * Removes a single unit of a product from the user's current cart.
     * @param user - The cart owner.
     * @param product - The product identifier.
     * @returns A promise resolving to true if the product was successfully removed.
     */
    async removeProductFromCart(user: User, product: string): Promise<Boolean>{
        try{
            let price = await this.dao.productExists(product);
            price = -price;
            if(!price)                                              //  Check if the product Exist first of all
                return Promise.reject(new ProductNotFoundError());  //  If not --> Error product does not Exist

            const cartId = await this.dao.getCartId(user.username, false);
            if(!cartId)                                             //  Than check if current cart exists
                return Promise.reject(new CartNotFoundError());     //  If not --> Error current cart does nt exist

            const total = await this.dao.cartIsEmpty(cartId);
            if(total)                                               //  Lastly check if cart has product to checkout
                return Promise.reject(new CartNotFoundError());     //  If not --> Error car is empty
        
            const quantity = await this.dao.alreadyInCart(cartId, product);
            if(!quantity || quantity===0)                           //  Additional check to see whether product is alrady in Cart, if so increase the counter?
                return Promise.reject(new ProductNotInCartError()); //  If yes --> Error product already in cart

            
            await this.dao.removeProductFromCart(cartId, product, quantity); // To remove a product i have to check the quantity, if is 1->delete else decrease quantity counter
            await this.dao.updateTotal(cartId, price);

                return Promise.resolve(true);
        }catch(error){
            return Promise.reject(error);
        }
    }


    /**
     * Clears all products from the user's current cart.
     * @param user - The cart owner.
     * @returns A promise resolving to true upon successful clearance.
     */
    async clearCart(user: User):Promise<Boolean> {
        const cartId = await this.dao.getCartId(user.username, false);
        await this.dao.delProdsFromCart(cartId);
        return this.dao.clearCart(cartId);
        
    }

    /**
     * Deletes all carts across all users.
     * @returns A promise resolving to true if deletion was successful.
     */
    async deleteAllCarts():Promise<Boolean> {
       return this.dao.deleteAllCarts();
 
    }

    /**
     * Fetches all carts from the database.
     * @returns A promise resolving to an array of all carts.
     */
    async getAllCarts():Promise<Cart[]>{

        var carts: Cart[] = await this.dao.getAllCarts();
        const cartId = await this.dao.getAllCartsIds();
        for(var i=0; i<carts.length; i++){
            if(carts[i].total > 0)
                carts[i].products = await this.dao.getProductsInCart(cartId[i]);
        }
        return Promise.resolve(carts);
              
    }
}

export default CartController