const PRODUCT_NOT_FOUND = "Product not found";
const PRODUCT_ALREADY_EXISTS = "The product already exists";
const PRODUCT_SOLD = "Product already sold";
const EMPTY_PRODUCT_STOCK = "Product stock is empty";
const LOW_PRODUCT_STOCK = "Product stock cannot satisfy the requested quantity";
const INVALID_GROUPING_PARAMETER = "Invalid grouping parameter";
const INVALID_CATEGORY_PARAMETER = "Invalid category parameter";
const INVALID_MODEL_PARAMETER = "Invalid model parameter";

class InvalidGroupingParameterError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(INVALID_GROUPING_PARAMETER);
        this.customMessage = INVALID_GROUPING_PARAMETER;
        this.customCode = 422;
    }
}

class InvalidCategoryParameterError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(INVALID_CATEGORY_PARAMETER);
        this.customMessage = INVALID_CATEGORY_PARAMETER;
        this.customCode = 422;
    }
}

class InvalidModelParameterError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(INVALID_MODEL_PARAMETER);
        this.customMessage = INVALID_MODEL_PARAMETER;
        this.customCode = 422;
    }
}
/**
 * Represents an error that occurs when a product is not found.
 */
class ProductNotFoundError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(PRODUCT_NOT_FOUND);
        this.customMessage = PRODUCT_NOT_FOUND;
        this.customCode = 404;
    }
}

class ParameterValidationError extends Error {
    customCode: number;

    constructor() {
        super("Invalid request");
        this.customCode = 422;  // Set the custom code for parameter validation errors
    }
}


/**
 * Represents an error that occurs when a product id already exists.
 */
class ProductAlreadyExistsError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(PRODUCT_ALREADY_EXISTS);
        this.customMessage = PRODUCT_ALREADY_EXISTS;
        this.customCode = 409;
    }
}

/**
 * Represents an error that occurs when a product is already sold.
 */
class ProductSoldError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(PRODUCT_SOLD);
        this.customMessage = PRODUCT_SOLD;
        this.customCode = 409;
    }
}

/**
 * Represents an error that occurs when the product stock is empty.
 */
class EmptyProductStockError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(EMPTY_PRODUCT_STOCK);
        this.customMessage = EMPTY_PRODUCT_STOCK;
        this.customCode = 409;
    }
}

/**
 * Represents an error that occurs when the product stock is low.
 */
class LowProductStockError extends Error {
    customMessage: string;
    customCode: number;

    constructor() {
        super(LOW_PRODUCT_STOCK);
        this.customMessage = LOW_PRODUCT_STOCK;
        this.customCode = 409;
    }
}

export { 
    ProductNotFoundError, 
    ProductAlreadyExistsError, 
    ProductSoldError, 
    EmptyProductStockError, 
    LowProductStockError, 
    InvalidGroupingParameterError, 
    InvalidCategoryParameterError, 
    InvalidModelParameterError ,
    ParameterValidationError
};