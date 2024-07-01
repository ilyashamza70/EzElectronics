import db from "../db/db";
import { Product } from "../components/product";
import { 
    ProductNotFoundError, 
    ProductAlreadyExistsError, 
    EmptyProductStockError, 
    LowProductStockError,
    ParameterValidationError
} from "../errors/productError";
import dayjs from "dayjs";
import { error } from "console";
class ProductDAO {
    async registerProducts(
        model: string,
        category: string,
        quantity: number,
        details: string | null,
        arrivalDate: string,
        sellingPrice: number
    ): Promise<boolean> {

        // If no arrival date is provided, set it to the current date
        if (!arrivalDate) {
            arrivalDate = new Date().toISOString().split('T')[0];
        }

        // Validate arrival date
        const currentDate = new Date().toISOString().split('T')[0];
        if (arrivalDate > currentDate) {
            throw new Error("Arrival date cannot be in the future.");
        }

        // Check if product already exists
        const checkQuery = `SELECT 1 FROM products WHERE model = ? AND category = ?`;
        const checkValues = [model, category];

        return new Promise<boolean>((resolve, reject) => {
            db.get(checkQuery, checkValues, (err: Error | null, row: any) => {
                if (err) {
                    return reject(new Error(`Error checking product existence: ${err.message}`));
                }

                if (row) {
                    // Product already exists
                    return reject(new ProductAlreadyExistsError());
                }

                // Product does not exist, proceed to insert
                const insertQuery = `INSERT INTO products (model, category, quantity, details, sellingPrice, arrivalDate) VALUES ( ?, ?, ?, ?, ?, ?)`;
                const insertValues = [model, category, quantity, details, sellingPrice, arrivalDate];

                db.run(insertQuery, insertValues, (err: Error | null) => {
                    if (err) {
                        return reject(new Error(`Error creating product: ${err.message}`));
                    }
                    resolve(true);
                });
            });
        });
    }

    async updateProduct(model: string, updateFields: Partial<Product>): Promise<boolean> {
        const fields = Object.keys(updateFields) as (keyof Product)[];
        const values = fields.map(field => updateFields[field]);

        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const setClause = fields.map((field, index) => `${field} = ?`).join(", ");
        const updateQuery = `UPDATE products SET ${setClause} WHERE model = ?`;
        values.push(model);

        const selectQuery = `SELECT arrivalDate FROM products WHERE model = ?`;

        return new Promise<boolean>((resolve, reject) => {
            db.get(selectQuery, [model], (err: Error | null, row: any) => {
                if (err) {
                    return reject(new Error(`Error checking product existence: ${err.message}`));
                }
                if (!row) {
                    return reject(new ProductNotFoundError());
                }

                // Validate changeDate if provided
                if (updateFields.changeDate) {
                    const changeDate = new Date(updateFields.changeDate).toISOString().split('T')[0];
                    const currentDate = new Date().toISOString().split('T')[0];
                    const arrivalDate = new Date(row.arrivalDate).toISOString().split('T')[0];

                    if (changeDate > currentDate || changeDate < arrivalDate) {
                        return reject(new Error('Change date must be between the arrival date and the current date'));
                    }
                }

                db.run(updateQuery, values, (err: Error | null) => {
                    if (err) {
                        return reject(new Error(`Error updating product: ${err.message}`));
                    }
                    resolve(true);
                });
            });
        });
    }

    async getProducts(grouping?: string, category?: string, model?: string): Promise<Product[]> {
        // Validate parameters
        if (
            (grouping && typeof grouping !== 'string') ||
            (category && typeof category !== 'string') ||
            (model && typeof model !== 'string') ||
            (grouping && !["category", "model"].includes(grouping)) ||
            (category && !["Smartphone", "Laptop", "Appliance"].includes(category)) ||
            (model && typeof model !== 'string') ||
            // Specific invalid combinations
            (grouping === 'category' && (!category || model)) ||
            (grouping === 'model' && (!model || category))
        ) {
            const error = new Error("Invalid query parameter");
            (error as any).customCode = 422;
            throw error;
        }
    
        // Construct the query
        const query = `
            SELECT * FROM products
            WHERE 1=1
            ${category ? `AND category = ?` : ''}
            ${model ? `AND model = ?` : ''}
            ${grouping ? `GROUP BY ${grouping}` : ''}
        `;
        const params: any[] = [];
        if (category) params.push(category);
        if (model) params.push(model);
    
        return new Promise<Product[]>((resolve, reject) => {
            db.all(query, params, (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(new Error(`Error retrieving products: ${err.message}`));
                }
                resolve(rows);
            });
        });
    }
    
    async getAvailableProducts(category?: string, model?: string): Promise<Product[]> {
        // Validate parameters
        if ((category && !["Smartphone", "Laptop", "Appliance"].includes(category)) ||
            (model && typeof model !== 'string')) {
            throw new ParameterValidationError();
        }
    
        if (model === 'none') {
            throw new ProductNotFoundError();
        }
    
        // Check if model is 'none', and handle as a special case
        // (Note: This might be redundant due to the above throw, but included for clarity in case of adjustments)
        
        // Construct the query
        let query = "SELECT * FROM products WHERE quantity > 0";
        const params: any[] = [];
        
        if (category) {
            query += " AND category = ?";
            params.push(category);
        }
        
        if (model) {
            query += " AND model = ?";
            params.push(model);
        }
        
        return new Promise<Product[]>((resolve, reject) => {
            db.all(query, params, (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(new Error(`Error retrieving products: ${err.message}`));
                } else {
                    resolve(rows);
                }
            });
        });
    }
    
    
    

    getProduct(model: string): Promise<Product> {
        const query = `SELECT * FROM products WHERE model = ?`;
        const values = [model];

        return new Promise<Product>((resolve, reject) => {
            db.get(query, values, (err: Error | null, row: any) => {
                if (err) {
                    return reject(new Error(`Error fetching product: ${err.message}`));
                }
                if (!row) {
                    return reject(new ProductNotFoundError());
                }
                resolve(row as Product);
            });
        });
    }
    async getAllProducts(): Promise<Product[]> {
        const query = `SELECT * FROM products`;

        return new Promise<Product[]>((resolve, reject) => {
            db.all(query, (err: Error | null, rows: any[]) => {
                if (err) {
                    return reject(new Error(`Error fetching all products: ${err.message}`));
                }
               
                resolve(rows as Product[]);
            });
        });
    }

    
     async   deleteAllProducts(): Promise<boolean> {
            const query = `DELETE FROM products`;
    
            return new Promise<boolean>((resolve, reject) => {
                db.run(query, function (err: Error | null) {
                    
                    console.log("All products deleted in DAO");
                    resolve(true);
                });
            });
        }
    
    async deleteProduct(model: string): Promise<boolean> {
        const query = `DELETE FROM products WHERE model = ?`;
        const values = [model];

        return new Promise<boolean>((resolve, reject) => {
            db.run(query, values, function(err: Error | null) {
                if (err) {
                    return reject(new Error(`Error deleting product: ${err.message}`));
                }
                if (this.changes === 0) {
                    return reject(new ProductNotFoundError());
                }
                resolve(true);
            });
        });
    }

    async sellProduct(model: string, quantity: number, sellingDate?: string): Promise<boolean> {
        const product = await this.getProduct(model);
        if (!product) {
            throw new ProductNotFoundError();
        }
        if (product.quantity === 0) {
            throw new EmptyProductStockError();
        }
        if (product.quantity < quantity) {
            throw new LowProductStockError();
        }

        // Use the provided sellingDate or set it to the current date if not provided
        const currentDate = new Date().toISOString().split('T')[0];
        if (!sellingDate) {
            sellingDate = currentDate;
        }

        // Validate sellingDate
        const arrivalDate = dayjs(product.arrivalDate).format('YYYY-MM-DD');
        if (sellingDate > currentDate || sellingDate < arrivalDate) {
            throw new Error('Selling date must be between the arrival date and the current date');
        }

        const updatedQuantity = product.quantity - quantity;
        const query = `UPDATE products SET quantity = ?, sellingDate = ? WHERE model = ?`;
        const values = [updatedQuantity, sellingDate, model];

        return new Promise<boolean>((resolve, reject) => {
            db.run(query, values, (err: Error | null) => {
                if (err) {
                    return reject(new Error(`Error selling product: ${err.message}`));
                }
                resolve(true);
            });
        });
    }

    async changeProductQuantity(model: string, newQuantity: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const product = await this.getProduct(model);
            if (!product) {
                return reject(new ProductNotFoundError());
            }

            const changeDate = dayjs().format('YYYY-MM-DD');
            const query = `UPDATE products SET quantity = ?, changeDate = ? WHERE model = ?`;
            const values = [newQuantity, changeDate, model];

            db.run(query, values, (err: Error | null) => {
                if (err) {
                    return reject(new Error(`Error updating product quantity: ${err.message}`));
                }
                resolve(true);
            });
        });
    }
}

export default ProductDAO;
