import ProductDAO from "../dao/productDAO";
import { Product } from "../components/product";
import { 
    ProductNotFoundError, 
    ProductAlreadyExistsError, 
    EmptyProductStockError, 
    LowProductStockError 
} from "../errors/productError";
import dayjs  from "dayjs";
/**
 * Represents a controller for managing products.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class ProductController {
    private dao: ProductDAO;

    constructor() {
        this.dao = new ProductDAO();
    }

    /**
     * Registers a new product concept (model, with quantity defining the number of units available) in the database.
     * @param model The unique model of the product.
     * @param category The category of the product.
     * @param quantity The number of units of the new product.
     * @param details The optional details of the product.
     * @param sellingPrice The price at which one unit of the product is sold.
     * @returns A Promise that resolves to nothing.
     */
    async registerProducts(
        model: string,
        category: string,
        quantity: number,
        details: string | null,
        arrivalDate: string | undefined,
        sellingPrice: number
    ): Promise<void> {
        try {
            await this.dao.registerProducts(
                model,
                category,
                quantity,
                details,
                arrivalDate,
                sellingPrice
            );
        } catch (error) {
            if (error instanceof ProductAlreadyExistsError) {
                throw new ProductAlreadyExistsError();
            } else if (error ) {
                throw new Error(error.message);
            }
            throw error;
        }
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.dao.getAllProducts();
            return products;
        } catch (error) {
            // If an error occurs, log it and return an empty array
            console.error("Error fetching products:", error.message);
            return [];
        }
    }

    /**
     * Increases the available quantity of a product through the addition of new units.
     * @param model The model of the product to increase.
     * @param newQuantity The number of product units to add. This number must be added to the existing quantity, it is not a new total.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    // In ProductController.ts
// In ProductController.ts
async changeProductQuantity(model: string, newQuantity: number, changeDate?: string): Promise<number> {
    const product = await this.dao.getProduct(model);
    if (!product) {
        throw new ProductNotFoundError();
    }

    product.quantity = product.quantity + newQuantity;
    
    const updateFields: Partial<Product> = { quantity: product.quantity };
    if (changeDate) {
        updateFields.changeDate = changeDate;
    }

    await this.dao.updateProduct(model, updateFields);
    return product.quantity;
}


    /**
     * Decreases the available quantity of a product through the sale of units.
     * @param model The model of the product to sell.
     * @param quantity The number of product units that were sold.
     * @returns A Promise that resolves to the new available quantity of the product.
     */
    async sellProduct(model: string, quantity: number, sellingDate?: string): Promise<number> {
        const product = await this.dao.getProduct(model);
        if (!product) {
            throw new ProductNotFoundError();
        }
        if (product.quantity === 0) {
            throw new EmptyProductStockError();
        }
        if (product.quantity < quantity) {
            throw new LowProductStockError();
        }
    
        // Validate sellingDate
        const currentDate = new Date().toISOString().split('T')[0];
        const arrivalDate = dayjs(product.arrivalDate).format('YYYY-MM-DD');
    
        if (sellingDate) {
            const sellingDateParsed = dayjs(sellingDate, 'YYYY-MM-DD');
            if (!sellingDateParsed.isValid() || sellingDateParsed.isBefore(arrivalDate) || sellingDateParsed.isAfter(currentDate)) {
                throw new Error('Selling date must be between the arrival date and the current date');
            }
        } else {
            sellingDate = currentDate;
        }
    
        product.quantity -= quantity;
        
        const updateFields: Partial<Product> = { quantity: product.quantity };
        if (sellingDate) {
            updateFields.sellingDate = sellingDate;
        }
        
        await this.dao.updateProduct(model, updateFields);
        return product.quantity;
    }
    


    
    /**
     * Returns all products in the database, with the option to filter them by category or model.
     * @param grouping An optional parameter. If present, it can be either "category" or "model".
     * @param category An optional parameter. It can only be present if grouping is equal to "category" (in which case it must be present) and, when present, it must be one of "Smartphone", "Laptop", "Appliance".
     * @param model An optional parameter. It can only be present if grouping is equal to "model" (in which case it must be present and not empty).
     * @returns A Promise that resolves to an array of Product objects.
     */
    // In ProductController.ts
    
    async getProducts(grouping: string | null, category: string | null, model: string | null): Promise<Product[]> {
        // Validate parameters
        if (grouping && !["category", "model"].includes(grouping)) {
            const error = new Error("Invalid grouping parameter");
            (error as any).customCode = 422;
            throw error;
        }

        if (category && !["Smartphone", "Laptop", "Appliance"].includes(category)) {
            const error = new Error(`Invalid category: ${category}`);
            (error as any).customCode = 422;
            throw error;
        }

        if (model && typeof model !== 'string') {
            const error = new Error("Invalid model parameter");
            (error as any).customCode = 422;
            throw error;
        }

        const allProducts = await this.dao.getAllProducts();

        if (grouping === "category" && category) {
            return allProducts.filter(product => product.category === category);
        } else if (grouping === "model" && model) {
            const filteredProducts = allProducts.filter(product => product.model === model);
            if (filteredProducts.length === 0) {
                throw new ProductNotFoundError();
            }
            return filteredProducts;
        } else {
            return allProducts;
        }
    }
// ProductController.ts
async getAvailableProducts(category?: string, model?: string): Promise<Product[]> {
    return this.dao.getAvailableProducts(category, model);
}




    /**
     * Deletes all products.
     * @returns A Promise that resolves to `true` if all products have been successfully deleted.
     */
    async deleteAllProducts(): Promise<void> {
        await this.dao.deleteAllProducts();
    }
    /**
     * Deletes one product, identified by its model.
     * @param model The model of the product to delete.
     * @returns A Promise that resolves to `true` if the product has been successfully deleted.
     */
    // In ProductController.ts
// In ProductController.ts
async deleteProduct(model: string): Promise<boolean> {
    const product = await this.dao.getProduct(model);
    if (!product) {
        throw new ProductNotFoundError();
    }
    await this.dao.deleteProduct(model);
    return true;
}



    // In ProductController.ts
    async getProduct(model: string): Promise<Product> {
    const product = await this.dao.getProduct(model);
    if (!product) {
        throw new ProductNotFoundError();
    }
    return product;
}

}

export default ProductController;
