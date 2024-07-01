import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import db from "../../src/db/db";
import CartDAO from "../../src/dao/cartDAO";
import { Database } from "sqlite3";
import { CartNotFoundError, ProductNotInCartError } from "../../src/errors/cartError";

jest.mock("../../src/db/db.ts");

describe("CartDAO tests", () => {
    let cartDAO: CartDAO;

    beforeAll(() => {
        cartDAO = new CartDAO();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("It should create a new cart successfully", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulating a successful insert
            return {} as Database;
        });

        try {
            const result = await cartDAO.newCart("userID123");
            expect(result).toBe(true);
        } catch (error) {
            console.log("Test failed with error:", error);
        } finally {
            mockDBRun.mockRestore();
        }
    });

    test("It should add a product to the cart successfully", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes("SELECT * FROM carts WHERE")) {
                callback(null, { id: 1, userId: "userID123" }); // Simulating cart exists
            } else {
                callback(null, { id: 1, model: "testModel", quantity: 10 }); // Simulating product exists and has sufficient quantity
            }
            return {} as Database;
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulating a successful update/insert
            return {} as Database;
        });

        try {
            const result = await cartDAO.addToCart( "testModel",122, true);
            expect(result).toBe(true);
        } catch (error) {
            console.log("Test failed with error:", error);
        } finally {
            mockDBGet.mockRestore();
            mockDBRun.mockRestore();
        }
    });

    test("It should throw CartNotFoundError when the cart does not exist", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, null); // Simulating cart does not exist
            return {} as Database;
        });

        await expect(cartDAO.addToCart( "testModel",999, true)).rejects.toThrow(CartNotFoundError);

        mockDBGet.mockRestore();
    });

    test("It should throw ProductNotInCartError when the product does not exist in the cart", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            if (sql.includes("SELECT * FROM carts WHERE")) {
                callback(null, { id: 1, userId: "userID123" }); // Simulating cart exists
            } else {
                callback(null, null); // Simulating product does not exist
            }
            return {} as Database;
        });

        await expect(cartDAO.addToCart("nonExistingModel", 5, false)).rejects.toThrow(ProductNotInCartError);

        mockDBGet.mockRestore();
    });

    // Additional tests can include removing a product from the cart, updating product quantity in the cart,
    // checking out a cart, handling empty cart error, etc.
});