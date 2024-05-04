import { Product } from "../components/product";
import ProductDAO from "../dao/productDAO";
import { ProductNotFoundError } from "../errors/productError";

/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {
    private dao: ProductDAO

    constructor() {
        this.dao = new ProductDAO
    }


    /**
     * Registers the arrival of a new (set of) product(s). An arrival consists of many entities of the same product.
     * @param model - The common model of all products.
     * @param category - The common category of all products.
     * @param details - The common details of all products (nullable)
     * @param quantity - The total amount of products that have arrived.
     * @param arrivalDate - The date of arrival (in format YYYY-MM-DD). If not provided, the current date should be used.
     * @param sellingPrice - The price at which each single product will be sold.
     * @returns A Promise that resolves to a string confirming that the products have arrived.
     */
    async registerArrival(model: string, category: string, details: string, quantity: number, arrivalDate: string | null, sellingPrice: number) {

    }

    /**
     * Registers the arrival of a single new product.
     * @param code - The unique code of the product.
     * @param sellingPrice - The price at which the product will be sold.
     * @param model - The model of the product.
     * @param category - The category of the product.
     * @param details - The details of the product (nullable)
     * @param arrivalDate - The date of arrival (in format YYYY-MM-DD). If not provided, the current date must be used.
     * @returns A Promise that resolves to the code of the product that has been registered.
     */
    async registerProduct(code: string, sellingPrice: number, model: string, category: string, details: string, arrivalDate: string | null) {

    }

    /**
     * Marks a product as sold
     * @param code - The code of the product to sell.
     * @param sellingDate - The date of selling (in format YYYY-MM-DD). If not provided, the current must should be used.
     * @returns A Promise that resolves to the code of the product that has been sold.
     */
    async sellProduct(code: string, sellingDate: string | null) {
    }

    /**
     * Returns all products, or only the ones that have been sold or not sold.
     * @param sold - If not provided, all products should be returned. If set to "yes", only the sold products should be returned. If set to "no", only the unsold products should be returned.
     * @returns A Promise that resolves to an array of products.
     */
    async getProducts(sold: string | null) {
    }

    /**
     * Returns a product by its code.
     * @param code - The code of the product to retrieve.
     * @returns A Promise that resolves to a single product.
     */
    async getProduct(code: string) { }

    /**
     * Returns all products of a specific category, or only the ones that have been sold or not sold.
     * @param category - The category of the products to retrieve.
     * @param sold - If not provided, all products should be returned. If set to "yes", only the sold products should be returned. If set to "no", only the unsold products should be returned.
     * @returns A Promise that resolves to an array of products.
     */
    async getProductsByCategory(category: string, sold: string | null) { }

    /**
     * Returns all products of a specific model, or only the ones that have been sold or not sold.
     * @param model - The model of the products to retrieve.
     * @param sold - If not provided, all products should be returned. If set to "yes", only the sold products should be returned. If set to "no", only the unsold products should be returned.
     * @returns A Promise that resolves to an array of products.
     */
    async getProductsByModel(model: string, sold: string | null) { }

    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts() { }

    /**
     * Deletes a specific product.
     * @param code - The code of the product to delete.
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    async deleteProduct(code: string) { }

}

export default ProductController;