import { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError } from "../errors/cartError";
import { ProductNotFoundError, ProductSoldError } from "../errors/productError";
import Cart from "../components/cart";
import { Product } from "../components/product";
import db from "../db/db";

/**
 * A class that implements the interaction with the database for all cart-related operations.
 */
class CartDAO {
    //Interaction with the database must be implemented here
}

export default CartDAO