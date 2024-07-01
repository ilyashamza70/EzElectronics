import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import ProductController from "../../src/controllers/productController";
import ProductDAO from "../../src/dao/productDAO";
import { Category, Product } from "../../src/components/product";
import { ProductAlreadyExistsError, ProductNotFoundError, EmptyProductStockError, LowProductStockError } from "../../src/errors/productError";

jest.mock("../../src/dao/productDAO");

const mockProductDAO = jest.fn();
let controller: ProductController;

beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
    controller = new ProductController();
});

describe("ProductController registerProducts method", () => {
    test("It should call registerProducts on ProductDAO and handle successful registration", async () => {
        const testProduct = {
            model: "test",
            category: Category.SMARTPHONE, // Ensure this matches the Category type
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        // Mock the DAO's registerProducts method to return true
        const mockRegisterProducts = jest.spyOn(ProductDAO.prototype, "registerProducts").mockResolvedValueOnce(true);

        // Call the controller method
        await controller.registerProducts(
            testProduct.model,
            testProduct.category,
            testProduct.quantity,
            testProduct.details,
            testProduct.arrivalDate,
            testProduct.sellingPrice
            
        );

        // Verify the DAO method was called correctly
        expect(mockRegisterProducts).toHaveBeenCalledTimes(1);
        expect(mockRegisterProducts).toHaveBeenLastCalledWith(
            testProduct.model,
            testProduct.category,
            testProduct.quantity,
            testProduct.details,
            testProduct.arrivalDate,
            testProduct.sellingPrice
            
        );
    });

    test("It should throw ProductAlreadyExistsError when the DAO throws this error", async () => {
        const testProduct = {
            model: "test",
            category: Category.SMARTPHONE, // Ensure this matches the Category type
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate:"2025-07-07"
        };

        // Mock the DAO's registerProducts method to throw ProductAlreadyExistsError
        const mockRegisterProducts = jest.spyOn(ProductDAO.prototype, "registerProducts").mockRejectedValueOnce(new ProductAlreadyExistsError());
        
        // Expect the controller method to throw the same error
        await expect(controller.registerProducts(
            testProduct.model,
            testProduct.category,
            testProduct.quantity,
            testProduct.details,
            testProduct.arrivalDate,
            testProduct.sellingPrice
        )).rejects.toThrow(ProductAlreadyExistsError);

        // Verify the DAO method was called correctly
        expect(mockRegisterProducts).toHaveBeenCalledTimes(1);
        expect(mockRegisterProducts).toHaveBeenLastCalledWith(
            testProduct.model,
            testProduct.category,
            testProduct.quantity,
            testProduct.details,
            testProduct.arrivalDate,
            testProduct.sellingPrice
        );
    });

    test("It should throw an error when invalid parameters are provided", async () => {
        const invalidProducts = [
            { model: "", category: Category.SMARTPHONE, quantity: 50, details: "test,test", sellingPrice: 700,arrivalDate:"2025-04-04" },
            { model: "test", category: "InvalidCategory" as Category, quantity: 50, details: "test,test", sellingPrice: 700,arrivalDate:"2025-04-04" },
            { model: "test", category: Category.SMARTPHONE, quantity: 0, details: "test,test", sellingPrice: 700,arrivalDate:"2025-04-04" }
        ];

        for (const invalidProduct of invalidProducts) {
            // Mock the DAO's registerProducts method to throw a generic error
            const mockRegisterProducts = jest.spyOn(ProductDAO.prototype, "registerProducts").mockRejectedValueOnce(new Error("Invalid product parameters"));
            
            // Expect the controller method to throw the same error
            await expect(controller.registerProducts(
                invalidProduct.model,
                invalidProduct.category,
                invalidProduct.quantity,
                invalidProduct.details,
                invalidProduct.arrivalDate,
                invalidProduct.sellingPrice
            )).rejects.toThrow("Invalid product parameters");

            // Verify the DAO method was called correctly
            expect(mockRegisterProducts).toHaveBeenCalledTimes(1);
            expect(mockRegisterProducts).toHaveBeenLastCalledWith(
                invalidProduct.model,
                invalidProduct.category,
                invalidProduct.quantity,
                invalidProduct.details,
                invalidProduct.arrivalDate,
                invalidProduct.sellingPrice
            );

            // Clear mocks for the next iteration
            jest.clearAllMocks();
        }
    });
});

describe("ProductController changeProductQuantity method", () => {
    test("It should update the quantity of an existing product", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-04-12"
        };

        const newQuantity = 20;
        const old_q = testProduct.quantity;

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Mock the DAO's updateProduct method to return true
        const mockUpdateProduct = jest.spyOn(ProductDAO.prototype, "updateProduct").mockResolvedValueOnce(true);

        // Call the controller method
        const updatedQuantity = await controller.changeProductQuantity(testProduct.model, newQuantity);

        // Verify the updated quantity
        expect(updatedQuantity).toBe(old_q + newQuantity);
        // Verify the DAO methods were called correctly
        expect(mockUpdateProduct).toHaveBeenCalledTimes(1);
        expect(mockUpdateProduct).toHaveBeenLastCalledWith(
            testProduct.model,
            { quantity: old_q + newQuantity }
        );
    });

    test("It should throw ProductNotFoundError when the product does not exist", async () => {
        const nonExistentModel = "nonexistent";
        const newQuantity = 20;

        // Mock the DAO's getProduct method to reject with ProductNotFoundError
        jest.spyOn(ProductDAO.prototype, "getProduct").mockRejectedValueOnce(new ProductNotFoundError());

        // Expect the controller method to throw the ProductNotFoundError
        await expect(controller.changeProductQuantity(nonExistentModel, newQuantity)).rejects.toThrow(ProductNotFoundError);
    });
});

describe("ProductController sellProduct method", () => {
    test("It should reduce the quantity of an existing product after a sale", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2023-12-12"
        };
        const old_q = testProduct.quantity;
        const saleQuantity = 20;
        const sellingDate = "2024-06-28";  // Example selling date, adjust as needed
    
        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);
    
        // Mock the DAO's updateProduct method to return true
        const mockUpdateProduct = jest.spyOn(ProductDAO.prototype, "updateProduct").mockResolvedValueOnce(true);
    
        // Call the controller method
        const remainingQuantity = await controller.sellProduct(testProduct.model, saleQuantity, sellingDate);
    
        // Verify the remaining quantity
        expect(remainingQuantity).toBe(old_q - saleQuantity);
    
        // Verify the DAO methods were called correctly
        expect(mockUpdateProduct).toHaveBeenCalledTimes(1);
        expect(mockUpdateProduct).toHaveBeenLastCalledWith(
            testProduct.model,
            { quantity: old_q - saleQuantity, sellingDate: sellingDate }  // Now includes sellingDate
        );
    });
    
    test("It should throw ProductNotFoundError when the product does not exist", async () => {
        const nonExistentModel = "nonexistent";
        const saleQuantity = 20;

        // Mock the DAO's getProduct method to reject with ProductNotFoundError
        jest.spyOn(ProductDAO.prototype, "getProduct").mockRejectedValueOnce(new ProductNotFoundError());

        // Expect the controller method to throw the ProductNotFoundError
        await expect(controller.sellProduct(nonExistentModel, saleQuantity)).rejects.toThrow(ProductNotFoundError);
    });

    test("It should throw EmptyProductStockError when the product stock is empty", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 0,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        const saleQuantity = 20;

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Expect the controller method to throw the EmptyProductStockError
        await expect(controller.sellProduct(testProduct.model, saleQuantity)).rejects.toThrow(EmptyProductStockError);
    });

    test("It should throw LowProductStockError when the sold quantity exceeds available stock", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 10,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        const saleQuantity = 20;

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Expect the controller method to throw the LowProductStockError
        await expect(controller.sellProduct(testProduct.model, saleQuantity)).rejects.toThrow(LowProductStockError);
    });

    test("It should show an error when trying to sell an unavailable product", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 0,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        const saleQuantity = 10;

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Expect the controller method to throw the EmptyProductStockError
        await expect(controller.sellProduct(testProduct.model, saleQuantity)).rejects.toThrow(EmptyProductStockError);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getProduct).toHaveBeenLastCalledWith(testProduct.model);
    });
});

describe("ProductController getProduct method", () => {
    test("It should return information about an existing product", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Call the controller method
        const product = await controller.getProduct(testProduct.model);

        // Verify the product information
        expect(product).toEqual(testProduct);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getProduct).toHaveBeenLastCalledWith(testProduct.model);
    });

    test("It should throw ProductNotFoundError when the product does not exist", async () => {
        const nonExistentModel = "nonexistent";

        // Mock the DAO's getProduct method to reject with ProductNotFoundError
        jest.spyOn(ProductDAO.prototype, "getProduct").mockRejectedValueOnce(new ProductNotFoundError());

        // Expect the controller method to throw the ProductNotFoundError
        await expect(controller.getProduct(nonExistentModel)).rejects.toThrow(ProductNotFoundError);
    });
});

describe("ProductController getProducts method", () => {
    test("It should return information about all products", async () => {
        const testProducts: Product[] = [
            { model: "test1", category: Category.SMARTPHONE, quantity: 50, details: "test,test", sellingPrice: 700, arrivalDate: "2025-12-12" },
            { model: "test2", category: Category.LAPTOP, quantity: 30, details: "test,test", sellingPrice: 1500, arrivalDate: "2025-12-12" }
        ];

        // Mock the DAO's getAllProducts method to return the test products
        jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(testProducts);

        // Call the controller method
        const products = await controller.getProducts(null, null, null);

        // Verify the product information
        expect(products).toEqual(testProducts);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
    });

    test("It should return information about all products in a specific category", async () => {
        const testProducts: Product[] = [
            { model: "test1", category: Category.SMARTPHONE, quantity: 50, details: "test,test", sellingPrice: 700, arrivalDate: "2025-12-12" },
            { model: "test2", category: Category.LAPTOP, quantity: 30, details: "test,test", sellingPrice: 1500, arrivalDate: "2025-12-12" }
        ];

        // Mock the DAO's getAllProducts method to return the test products
        jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(testProducts);

        // Call the controller method
        const products = await controller.getProducts("category", Category.SMARTPHONE, null);

        // Verify the product information
        expect(products).toEqual([testProducts[0]]);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
    });

    test("It should return an error when trying to view products of a non-existing category", async () => {
        const invalidCategory = "InvalidCategory";

        // Call the controller method and expect it to throw an error
        await expect(controller.getProducts("category", invalidCategory as Category, null)).rejects.toThrow(
            "Invalid category: " + invalidCategory
        );
    });

    test("It should return information about all products with a specific model", async () => {
        const testProducts: Product[] = [
            { model: "test1", category: Category.SMARTPHONE, quantity: 50, details: "test,test", sellingPrice: 700, arrivalDate: "2025-12-12" },
            { model: "test1", category: Category.LAPTOP, quantity: 30, details: "test,test", sellingPrice: 1500, arrivalDate: "2025-12-12" }
        ];

        // Mock the DAO's getAllProducts method to return the test products
        jest.spyOn(ProductDAO.prototype, "getAllProducts").mockResolvedValueOnce(testProducts);

        // Call the controller method
        const products = await controller.getProducts("model", null, "test1");

        // Verify the product information
        expect(products).toEqual(testProducts);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAllProducts).toHaveBeenCalledTimes(1);
    });
});

describe("ProductController getAvailableProducts method", () => {
    let testProducts: Product[];  // Explicitly typing the array as an array of Product

    beforeEach(() => {
        testProducts = [
            { model: "test1", category: Category.SMARTPHONE, quantity: 50, details: "test,test", sellingPrice: 700, arrivalDate: "2025-12-12" },
            { model: "test2", category: Category.LAPTOP, quantity: 0, details: "test,test", sellingPrice: 1500, arrivalDate: "2025-12-12" },
            { model: "test3", category: Category.SMARTPHONE, quantity: 30, details: "test,test", sellingPrice: 800, arrivalDate: "2025-12-12" }
        ];
        jest.spyOn(ProductDAO.prototype, "getAvailableProducts").mockImplementation(async (category?: string, model?: string) => {
            let filteredProducts = testProducts.filter((p: Product) => p.quantity > 0);
            if (category) {
                filteredProducts = filteredProducts.filter((p: Product) => p.category === category);
            }
            if (model) {
                filteredProducts = filteredProducts.filter((p: Product) => p.model === model);
            }
            return filteredProducts;
        });
    });

    test("It should return information about all available products", async () => {
        // Call the controller method
        const products = await controller.getAvailableProducts();

        // Verify the product information
        expect(products).toEqual([testProducts[0], testProducts[2]]);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(undefined, undefined);
    });

    test("It should return information about all available products in a specific category", async () => {
        // Call the controller method
        const products = await controller.getAvailableProducts("Smartphone");

        // Verify the product information
        expect(products).toEqual([testProducts[0], testProducts[2]]);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith("Smartphone", undefined);
    });

    test("It should return information about all available products with a specific model", async () => {
        // Call the controller method
        const products = await controller.getAvailableProducts(undefined, "test1");

        // Verify the product information
        expect(products).toEqual([testProducts[0]]);

        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getAvailableProducts).toHaveBeenCalledWith(undefined, "test1");
    });

    test("It should return an error when trying to view available products of a non-existing category", async () => {
        const invalidCategory = "InvalidCategory";
    
        // Call the controller method and check for an empty array
        const products = await controller.getAvailableProducts(invalidCategory);
        expect(products).toEqual([]);
    });
    
});

describe("ProductController deleteProduct method", () => {
    test("It should delete an existing product", async () => {
        const testProduct: Product = {
            model: "test",
            category: Category.SMARTPHONE,
            quantity: 50,
            details: "test,test",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        };

        // Mock the DAO's getProduct method to return the test product
        jest.spyOn(ProductDAO.prototype, "getProduct").mockResolvedValueOnce(testProduct);

        // Mock the DAO's deleteProduct method to return true
        const mockDeleteProduct = jest.spyOn(ProductDAO.prototype, "deleteProduct").mockResolvedValueOnce(true);

        // Call the controller method
        const result = await controller.deleteProduct(testProduct.model);

        // Verify the product was deleted
        expect(result).toBe(true);

        // Verify the DAO methods were called correctly
        expect(ProductDAO.prototype.getProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getProduct).toHaveBeenLastCalledWith(testProduct.model);
        expect(mockDeleteProduct).toHaveBeenCalledTimes(1);
        expect(mockDeleteProduct).toHaveBeenLastCalledWith(testProduct.model);
    });

    test("It should throw ProductNotFoundError when the product does not exist", async () => {
        const nonExistentModel = "nonexistent";
    
        // Mock the DAO's getProduct method to reject with ProductNotFoundError
        jest.spyOn(ProductDAO.prototype, "getProduct").mockRejectedValueOnce(new ProductNotFoundError());
    
        // Expect the controller method to throw the ProductNotFoundError
        await expect(controller.deleteProduct(nonExistentModel)).rejects.toThrow(ProductNotFoundError);
    
        // Verify the DAO method was called correctly
        expect(ProductDAO.prototype.getProduct).toHaveBeenCalledTimes(1);
        expect(ProductDAO.prototype.getProduct).toHaveBeenLastCalledWith(nonExistentModel);
    });
    
});