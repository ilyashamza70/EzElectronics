/**
 * Represents a product offered by the online store.
 */
class Product {
    code: string;
    sellingPrice: number;
    model: string;
    category: Category;
    arrivalDate: string | null;
    sellingDate: string | null;
    details: string | null;

    /**
     * Creates a new instance of the Product class.
     * @param code - The product code. Every product has a unique code.
     * @param sellingPrice - The selling price of the product. This is the price at which the product is sold to the customer.
     * @param model - The model of the product. This is the name of the product.
     * @param category - The category of the product. This is the type of product.
     * @param arrivalDate - The arrival date of the product at the store.
     * @param sellingDate - The selling date of the product, is null if the product has not been sold yet. 
     * @param details - Additional details about the product, can be null.
     */
    constructor(code: string, sellingPrice: number, model: string, category: Category, arrivalDate: string | null, sellingDate: string | null, details: string | null) {
        this.code = code;
        this.sellingPrice = sellingPrice;
        this.model = model;
        this.category = category;
        this.arrivalDate = arrivalDate;
        this.sellingDate = sellingDate;
        this.details = details;
    }
}

/**
 * Represents the category of a product. The values present in this enum are the only valid values for the category of a product.
 */
enum Category {
    SMARTPHONE = "Smartphone",
    LAPTOP = "Laptop",
    APPLIANCE = "Appliance",
}


export { Product, Category }