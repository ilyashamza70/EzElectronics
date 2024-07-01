import { test, describe, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import ProductRoutes from "../../src/routers/productRoutes";
import ProductController from "../../src/controllers/productController";
import Authenticator from "../../src/routers/auth";
import { Product, Category } from "../../src/components/product";

jest.mock("../../src/controllers/productController");
jest.mock("../../src/routers/auth");

const app = express();
app.use(express.json());

const mockAuthenticator = {
    isLoggedIn: (req: Request, res: Response, next: NextFunction) => next(),
    isManager: (req: Request, res: Response, next: NextFunction) => next(),
    isAdminOrManager: (req: Request, res: Response, next: NextFunction) => next(),
    isCustomer: (req: Request, res: Response, next: NextFunction) => next(),
} as unknown as Authenticator;

const productRoutes = new ProductRoutes(mockAuthenticator);
app.use("/products", productRoutes.getRouter());

describe("ProductRoutes tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("It should register a product successfully", async () => {
        const testProduct = {
            model: "testModel",
            category: Category.SMARTPHONE,
            quantity: 50,
            details: "test details",
            arrivalDate:"2024-01-01",
            sellingPrice: 700,
        };
    
        // Include all required parameters in the mock and function call
        jest.spyOn(ProductController.prototype, "registerProducts").mockResolvedValueOnce();
    
        const response = await request(app).post("/products/").send(testProduct);
        expect(response.status).toBe(200);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.registerProducts).toHaveBeenCalledWith(
            testProduct.model,
            testProduct.category,
            testProduct.quantity,
            testProduct.details,
            testProduct.arrivalDate,
            testProduct.sellingPrice
        );
    });
    
    
    

    test("It should sell a product successfully", async () => {
        const testProductSell = {
            quantity: 20,
        };
    
        jest.spyOn(ProductController.prototype, "sellProduct").mockResolvedValueOnce(30);
    
        const response = await request(app).patch("/products/testModel/sell").send(testProductSell);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ quantity: 30 }); // Ensure this is the actual expected response
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.sellProduct).toHaveBeenCalledWith(
            "testModel", 20, undefined // Handle or remove this unexpected parameter
        );
    });
    

    test("It should get all products successfully", async () => {
        const mockProducts: Product[] = [
            {
                model: "testModel1",
                category: Category.SMARTPHONE,
                quantity: 50,
                details: "test details 1",
                sellingPrice: 700,
                arrivalDate: "2025-12-12",
            },
            {
                model: "testModel2",
                category: Category.LAPTOP,
                quantity: 30,
                details: "test details 2",
                sellingPrice: 1500,
                arrivalDate: "2025-12-13",
            },
        ];

        jest.spyOn(ProductController.prototype, "getProducts").mockResolvedValueOnce(mockProducts);

        const response = await request(app).get("/products/");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProducts);
        expect(ProductController.prototype.getProducts).toHaveBeenCalledTimes(1);
    });

    test("It should get available products successfully", async () => {
        const mockAvailableProducts: Product[] = [
            {
                model: "testModel1",
                category: Category.SMARTPHONE,
                quantity: 50,
                details: "test details 1",
                sellingPrice: 700,
                arrivalDate: "2025-12-12",
            },
            {
                model: "testModel2",
                category: Category.LAPTOP,
                quantity: 30,
                details: "test details 2",
                sellingPrice: 1500,
                arrivalDate: "2025-12-13",
            },
        ];

        jest.spyOn(ProductController.prototype, "getAvailableProducts").mockResolvedValueOnce(mockAvailableProducts);

        const response = await request(app).get("/products/available");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockAvailableProducts);
        expect(ProductController.prototype.getAvailableProducts).toHaveBeenCalledTimes(1);
    });

    test("It should delete a product successfully", async () => {
        jest.spyOn(ProductController.prototype, "deleteProduct").mockResolvedValueOnce(true);

        const response = await request(app).delete("/products/testModel");
        expect(response.status).toBe(200);
        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledTimes(1);
        expect(ProductController.prototype.deleteProduct).toHaveBeenCalledWith("testModel");
    });

    test("It should delete all products successfully", async () => {
        jest.spyOn(ProductController.prototype, "deleteAllProducts").mockResolvedValueOnce();

        const response = await request(app).delete("/products/");
        expect(response.status).toBe(200);
        expect(ProductController.prototype.deleteAllProducts).toHaveBeenCalledTimes(1);
    });
});
