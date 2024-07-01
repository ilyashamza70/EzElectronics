import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import db from "../../src/db/db";
import ReviewDAO from "../../src/dao/reviewDAO";
import { ProductReview } from "../../src/components/review";
import { ProductNotFoundError } from "../../src/errors/productError";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";

jest.mock("../../src/db/db");

describe("ReviewDAO tests", () => {
    let reviewDAO: ReviewDAO;

    beforeAll(() => {
        reviewDAO = new ReviewDAO();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    test("addReview should successfully add a review", async () => {
        const mockDBGet = jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 }); // Simulate product exists
            return db; // Return the db instance to match the expected return type
        }).mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 0 }); // Simulate review does not exist
            return db; // Return the db instance to match the expected return type
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulate successful insert
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good")).resolves.toBeUndefined();

        mockDBGet.mockRestore();
        mockDBRun.mockRestore();
    });

    test("addReview should throw ProductNotFoundError if product does not exist", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 }); // Simulate product does not exist
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good")).rejects.toThrow(ProductNotFoundError);
    });

    test("addReview should throw ExistingReviewError if review already exists", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 }); // Simulate product exists
            return db; // Return the db instance to match the expected return type
        }).mockImplementationOnce((sql, params, callback) => {
            callback(null, { count: 1 }); // Simulate review already exists
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good")).rejects.toThrow(ExistingReviewError);
    });
    
    test("addReview should handle database errors on product check", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good")).rejects.toThrow("Database error");
    });

    test("addReview should handle invalid input types", async () => {
        await expect(reviewDAO.addReview("iphone", "useruser", 6, "2024-01-01", "Good")).rejects.toThrow();
        await expect(reviewDAO.addReview("iphone", "useruser", 5, "invalid date", "Good")).rejects.toThrow();
    });

    test("addReview should handle boundary conditions for score", async () => {
        // Assuming score should be between 1 and 5
        await expect(reviewDAO.addReview("iphone", "useruser", 0, "2024-01-01", "Good")).rejects.toThrow();
        await expect(reviewDAO.addReview("iphone", "useruser", 6, "2024-01-01", "Good")).rejects.toThrow();
    });

    test("addReview should handle database errors on review existence check", async () => {
        jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { count: 1 }); // First call: Simulate product exists
                return db;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(new Error("Database error"), null); // Second call: Simulate database error on review check
                return db;
            });
    
        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good"))
            .rejects.toThrow("Error checking review existence: Database error");
    });
    
    test("addReview should handle SQL errors during review insertion", async () => {
        // Mock db.get to simulate product exists and no existing review
        jest.spyOn(db, "get")
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { count: 1 }); // Simulate product exists
                return db;
            })
            .mockImplementationOnce((sql, params, callback) => {
                callback(null, { count: 0 }); // Simulate review does not exist
                return db;
            });

        // Mock db.run to simulate an SQL error during the insert operation
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("SQL error during insert"), null);
            return db;
        });

        await expect(reviewDAO.addReview("iphone", "useruser", 5, "2024-01-01", "Good"))
            .rejects.toThrow("Error adding review: SQL error during insert");
    });
    
    test("addReview should throw NoReviewProductError if model is not provided", async () => {
        // Test with empty string model
        await expect(reviewDAO.addReview("", "useruser", 5, "2024-01-01", "Good")).rejects.toThrow(NoReviewProductError);
    });
    
    test("getProductReviews should retrieve reviews for a product", async () => {
        // Mock the db.get method to simulate checking if the product exists
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            // Simulate that the product exists by calling the callback with a count of 1
            callback(null, { count: 1 });
            return db;
        });
    
        // Mock the db.all method to simulate fetching reviews for the product
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(null, [
                { model: "iphone", username: "useruser", score: 5, date: "2024-01-01", comment: "Good" }
            ]);
            return db
        });
    
        const reviews = await reviewDAO.getProductReviews("iphone");
        expect(reviews).toEqual([new ProductReview("iphone", "useruser", 5, "2024-01-01", "Good")]);
    
        // Restore the mocks after the test
        mockDBGet.mockRestore();
        mockDBAll.mockRestore();
    });

    test("getProductReviews should throw NoReviewProductError if model is not provided", async () => {
        // Test with null model
        await expect(reviewDAO.getProductReviews(null)).rejects.toThrow(NoReviewProductError);

        // Test with empty string model
        await expect(reviewDAO.getProductReviews("")).rejects.toThrow(NoReviewProductError);
    });

    test("getProductReviews should handle database errors", async () => {
        // Mock db.get to simulate checking product existence
        const mockDBGet = jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            // Simulate product exists with a count of 1
            callback(null, { count: 1 });
            return db
        });
    
        // Mock db.all to simulate a database error when fetching reviews
        const mockDBAll = jest.spyOn(db, "all").mockImplementation((sql, params, callback) => {
            callback(new Error("Database error"), null);  // Simulate an error
            return db
        });

        await expect(reviewDAO.getProductReviews("iphone")).rejects.toThrow("Database error");
    
        // Restore the mocks after the test
        jest.restoreAllMocks();
    });

    test("should throw ProductNotFoundError if product does not exist", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 });
            return db;
        });

        await expect(reviewDAO.getProductReviews("nonexistent"))
            .rejects
            .toThrow(ProductNotFoundError);
    });
    
    test("deleteReview should successfully delete a review", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 }); // Simulate review exists
            return db; // Return the db instance to match the expected return type
        });

        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulate successful delete
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteReview("iphone", "useruser")).resolves.toBeUndefined();

        mockDBRun.mockRestore();
    });
    test("deleteReview should throw NoReviewProductError if model is not provided", async () => {
    
        // Test with empty string model
        await expect(reviewDAO.deleteReview("", "useruser")).rejects.toThrow(NoReviewProductError);
    });
    test("deleteReview should handle database errors on review existence check", async () => {
        jest.spyOn(db, "get").mockImplementationOnce((sql, params, callback) => {
            callback(new Error("Database error"), null);
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteReview("iphone", "useruser")).rejects.toThrow("Database error");
    });
    test("deleteReview should handle SQL errors during review deletion", async () => {
        // Mock db.get to simulate review exists
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 1 }); // Simulate review exists
            return db;
        });
    
        // Mock db.run to simulate an SQL error during the delete operation
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("SQL error during delete"), null);
            return db;
        });
    
        await expect(reviewDAO.deleteReview("iphone", "useruser"))
            .rejects.toThrow("Error deleting review: SQL error during delete");
    });

    test("deleteReviewsOfProduct should delete all reviews for a product", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(null); // Simulate successful delete
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteReviewsOfProduct("iphone")).resolves.toBeUndefined();

        mockDBRun.mockRestore();
    });
    test("deleteReviewsOfProduct should handle SQL errors during deletion", async () => {
        jest.spyOn(db, "run").mockImplementation((sql, params, callback) => {
            callback(new Error("SQL error"), null);
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteReviewsOfProduct("iphone")).rejects.toThrow("SQL error");
    });

    test("deleteReviewsOfProduct should throw ProductNotFoundError if product does not exist", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            callback(null, { count: 0 }); // Simulate product does not exist
            return db; // Return the db instance to match the expected return type
        });
    
        await expect(reviewDAO.deleteReviewsOfProduct("iphone")).rejects.toThrow(ProductNotFoundError);
    });

    test("deleteReviewsOfProduct should handle SQL errors during product existence check", async () => {
        jest.spyOn(db, "get").mockImplementation((sql, params, callback) => {
            const error = new Error("SQL error");
            callback(error, null); // Simulate SQL error during product check
            return db; // Return the db instance to match the expected return type
        });
    
        await expect(reviewDAO.deleteReviewsOfProduct("iphone")).rejects.toThrow("SQL error");
    });

    test("deleteAllReviews should delete all reviews", async () => {
        const mockDBRun = jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(null); // Simulate successful delete
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteAllReviews()).resolves.toBeUndefined();

        mockDBRun.mockRestore();
    });
    test("deleteAllReviews should handle SQL errors during deletion", async () => {
        jest.spyOn(db, "run").mockImplementation((sql, callback) => {
            callback(new Error("SQL error"), null);
            return db; // Return the db instance to match the expected return type
        });

        await expect(reviewDAO.deleteAllReviews()).rejects.toThrow("SQL error");
    });
});
