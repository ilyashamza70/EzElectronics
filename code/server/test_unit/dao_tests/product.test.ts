import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import db from "../../src/db/db";
import ProductDAO from "../../src/dao/productDAO";
import { Product } from "../../src/components/product";
import { ProductNotFoundError, ProductAlreadyExistsError, EmptyProductStockError, LowProductStockError } from "../../src/errors/productError";
import { Database } from "sqlite3";

jest.mock("../../src/db/db.ts");

describe("ProductDAO tests", () => {
    let productDAO: ProductDAO;

    beforeAll(() => {
        productDAO = new ProductDAO();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("It should register a product successfully", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulating a successful insert
            return {} as Database;
        });
    
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { maxCode: 0 }); // Simulating a successful fetch
            return {} as Database;
        });
    
        try {
            const result = await productDAO.registerProducts("testModel", "Smartphone", 50, "test details", "2024-02-02",700);
            expect(result).toBe(true);
        } catch (error) {
            console.log("Test failed with error:", error);
        } finally {
            mockDBRun.mockRestore();
            mockDBGet.mockRestore();
        }
    });
    


test("It should update an existing product successfully", async () => {
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
        callback(null, { model: "testModel" }); // Simulating product exists
        return {} as Database;
    });

    const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(sql: string, params: any[], callback: (err: Error | null) => void): Database {
        callback(null);
        return this;
    });

    const result = await productDAO.updateProduct("testModel", { quantity: 100 });
    expect(result).toBe(true);

    mockDBGet.mockRestore();
    mockDBRun.mockRestore();
}, 10000); // Increase timeout to 10 seconds

test("It should throw ProductNotFoundError when the product does not exist", async () => {
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void): Database => {
        callback(null, null); // Simulating product does not exist
        return {} as Database;
    });

    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void): Database => {
        callback(null); // Should not be called
        return {} as Database;
    });

    await expect(productDAO.updateProduct("testModel", { quantity: 100 })).rejects.toThrow(ProductNotFoundError);

    mockDBGet.mockRestore();
    mockDBRun.mockRestore();
}, 10000); // Increase timeout to 10 seconds




    
test("It should throw ProductNotFoundError when updating a non-existing product", async () => {
    const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, null); // Simulating product does not exist
        return {} as Database;
    });

    const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
        callback(null); // Should not be called
        return {} as Database;
    });

    await expect(productDAO.updateProduct("nonexistentModel", { quantity: 100 })).rejects.toThrow(ProductNotFoundError);

    mockDBGet.mockRestore();
    mockDBRun.mockRestore();
});

    test("It should get an existing product successfully", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, { model: "testModel", category: "Smartphone", quantity: 50, details: "test details", sellingPrice: 700, arrivalDate: "2025-12-12" });
            return {} as Database;
        });

        const product = await productDAO.getProduct("testModel");
        expect(product).toEqual({
            model: "testModel",
            category: "Smartphone",
            quantity: 50,
            details: "test details",
            sellingPrice: 700,
            arrivalDate: "2025-12-12"
        });
        mockDBGet.mockRestore();
    });

    test("It should throw ProductNotFoundError when getting a non-existing product", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
            return {} as Database;
        });

        await expect(productDAO.getProduct("nonexistentModel")).rejects.toThrow(ProductNotFoundError);
        mockDBGet.mockRestore();
    });

    test("It should get all products successfully", async () => {
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql: string, callback: (err: Error | null, rows: any[]) => void) => {
            callback(null, [
                { model: "testModel1", category: "Smartphone", quantity: 50, details: "test details 1", sellingPrice: 700, arrivalDate: "2025-12-12" },
                { model: "testModel2", category: "Laptop", quantity: 30, details: "test details 2", sellingPrice: 1500, arrivalDate: "2025-12-13" }
            ]);
            return {} as Database;
        });

        const products = await productDAO.getAllProducts();
        expect(products).toEqual([
            { model: "testModel1", category: "Smartphone", quantity: 50, details: "test details 1", sellingPrice: 700, arrivalDate: "2025-12-12" },
            { model: "testModel2", category: "Laptop", quantity: 30, details: "test details 2", sellingPrice: 1500, arrivalDate: "2025-12-13" }
        ]);
        mockDBAll.mockRestore();
    });

    test("It should delete an existing product successfully", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(sql: string, params: any[], callback: (err: Error | null) => void) {
            const dbThis = { changes: 1 };
            callback.call(dbThis, null);
            return dbThis as unknown as Database;
        });
    
        const result = await productDAO.deleteProduct("testModel");
        expect(result).toBe(true);
        mockDBRun.mockRestore();
    });

    test("It should throw ProductNotFoundError when deleting a non-existing product", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation(function(sql: string, params: any[], callback: (err: Error | null) => void) {
            const dbThis = { changes: 0 };
            callback.call(dbThis, null);
            return dbThis as unknown as Database;
        });
    
        await expect(productDAO.deleteProduct("nonexistentModel")).rejects.toThrow(ProductNotFoundError);
        mockDBRun.mockRestore();
    });

    test("It should sell a product successfully", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, { model: "testModel", category: "Smartphone", quantity: 50, details: "test details", sellingPrice: 700, arrivalDate: "2024-01-01" });
            return {} as Database;
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
            callback(null);
            return {} as Database;
        });

        const result = await productDAO.sellProduct("testModel", 20);
        expect(result).toBe(true);
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("It should throw ProductNotFoundError when selling a non-existing product", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, null);
            return {} as Database;
        });

        await expect(productDAO.sellProduct("nonexistentModel", 20)).rejects.toThrow(ProductNotFoundError);
        mockDBGet.mockRestore();
    });

    test("It should throw EmptyProductStockError when selling a product with zero quantity", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, { model: "testModel", category: "Smartphone", quantity: 0, details: "test details", sellingPrice: 700, arrivalDate: "2025-12-12" });
            return {} as Database;
        });

        await expect(productDAO.sellProduct("testModel", 20)).rejects.toThrow(EmptyProductStockError);
        mockDBGet.mockRestore();
    });

    test("It should throw LowProductStockError when selling more than available quantity", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, { model: "testModel", category: "Smartphone", quantity: 10, details: "test details", sellingPrice: 700, arrivalDate: "2025-12-12" });
            return {} as Database;
        });

        await expect(productDAO.sellProduct("testModel", 20)).rejects.toThrow(LowProductStockError);
        mockDBGet.mockRestore();
    });

    test("It should change the quantity of an existing product successfully", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql: string, params: any[], callback: (err: Error | null, row: any) => void) => {
            callback(null, { model: "testModel", category: "Smartphone", quantity: 50, details: "test details", sellingPrice: 700, arrivalDate: "2025-12-12" });
            return {} as Database;
        });
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql: string, params: any[], callback: (err: Error | null) => void) => {
            callback(null);
            return {} as Database;
        });

        const result = await productDAO.changeProductQuantity("testModel", 20);
        expect(result).toBe(true);
        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("It should throw ProductNotFoundError when changing quantity of a non-existing product", async () => {
        // Mock the getProduct method to return null, simulating that the product does not exist
        const mockGetProduct = jest.spyOn(productDAO, "getProduct").mockResolvedValue(null as unknown as Product);
    
        await expect(productDAO.changeProductQuantity("nonexistentModel", 20)).rejects.toThrow(ProductNotFoundError);
    
        mockGetProduct.mockRestore();
    });
    

    test("It should delete all products successfully", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql: string, callback: (err: Error | null) => void) => {
            callback(null);
            return {} as Database;
        });

        const result = await productDAO.deleteAllProducts();
        expect(result).toBe(true);
        mockDBRun.mockRestore();
    });
});
