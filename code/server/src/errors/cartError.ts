const ERROR_MESSAGES = {
    CartNotFound: "Cart not found",
    ProductInCart: "Product already in cart",
    ProductNotInCart: "Product not in cart",
    WrongUserCart: "Cart belongs to another user",
    EmptyCart: "Cart is empty",
    GenericError: "An error occurred"
};

const ERROR_CODES = {
    NotFound: 404,
    Conflict: 409,
    Forbidden: 403,
    BadRequest: 400,
    InternalServerError: 500
};
/**
 * Base class for custom cart-related errors. It extends the native Error class,
 * adding a custom message and a custom HTTP status code to better integrate with
 * web responses.
 */
class CartError extends Error {
    customMessage: string;
    customCode: number;

    constructor(message: string, code: number) {
        super(message);
        this.customMessage = message;
        this.customCode = code;
    }
}

/**
 * Error class for handling cases where a cart is not found. This could be used
 * when a user tries to access a cart that does not exist in the database.
 */
class CartNotFoundError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.CartNotFound, ERROR_CODES.NotFound);
    }
}

/**
 * Error class for handling cases where a product is already in the cart. This
 * could be used to prevent adding duplicate items to a cart.
 */
class ProductInCartError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.ProductInCart, ERROR_CODES.Conflict);
    }
}

/**
 * Error class for handling cases where a product is not found in the cart. This
 * could be used when attempting to remove or modify a product that isn't in the cart.
 */
class ProductNotInCartError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.ProductNotInCart, ERROR_CODES.NotFound);
    }
}

/**
 * Error class for handling cases where a cart belongs to another user. This could
 * be used to prevent users from accessing or modifying carts that do not belong to them.
 */
class WrongUserCartError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.WrongUserCart, ERROR_CODES.Forbidden);
    }
}

/**
 * Error class for handling cases where a cart is empty but an operation requiring
 * items in the cart is attempted. This could be used for checkout processes or
 * bulk modifications where an empty cart is invalid.
 */
class EmptyCartError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.EmptyCart, ERROR_CODES.BadRequest);
    }
}

/**
 * Generic error class for handling any other cart-related errors that do not fit
 * into the specific categories above. This provides a fallback error handling mechanism.
 */
class GenericCartError extends CartError {
    constructor() {
        super(ERROR_MESSAGES.GenericError, ERROR_CODES.InternalServerError);
    }
}
export { CartNotFoundError, ProductInCartError, ProductNotInCartError, WrongUserCartError, EmptyCartError, GenericCartError };