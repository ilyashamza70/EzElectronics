import { test, describe, expect, jest, beforeEach ,beforeAll} from "@jest/globals";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import ReviewRoutes from "../../src/routers/reviewRoutes";
import ReviewController from "../../src/controllers/reviewController";
import Authenticator from "../../src/routers/auth";
import { ProductReview } from "../../src/components/review";

jest.mock("../../src/controllers/reviewController");
jest.mock("../../src/routers/auth");

const app = express();
app.use(express.json());

beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
});

const mockAuthenticator = {
    isLoggedIn: (req: Request, res: Response, next: NextFunction) => next(),
    isCustomer: (req: Request, res: Response, next: NextFunction) => next(),
    isAdminOrManager: (req: Request, res: Response, next: NextFunction) => next(),
} as unknown as Authenticator;

const reviewRoutes = new ReviewRoutes(mockAuthenticator);
app.use("/reviews", reviewRoutes.getRouter());

describe("ReviewRoutes tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    test("It should add a review successfully", async () => {
        const testReview = {
            model: "testModel",
            score: 5,
            comment: "Great product!"
        };

        jest.spyOn(ReviewController.prototype, "addReview").mockResolvedValueOnce();

        const response = await request(app).post("/reviews/testModel").send(testReview);
        expect(response.status).toBe(200);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
            testReview.model,
            undefined, // Adjust according to actual expected behavior
            testReview.score,
            testReview.comment
        );
    });

    test("It should handle errors when adding a review fails", async () => {
        const testReview = {
            model: "testModel",
            score: 5,
            comment: "Great product!"
        };
    
        const errorMessage = "Error adding review";
        jest.spyOn(ReviewController.prototype, "addReview").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).post("/reviews/testModel").send(testReview);
        expect(response.status).toBe(500); // Assuming your error handler sets status to 500 on errors
        expect(response.text).toContain(errorMessage);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.addReview).toHaveBeenCalledWith(
            testReview.model,
            undefined, // Adjust according to actual expected behavior
            testReview.score,
            testReview.comment
        );
    });

    test("It should retrieve all reviews of a product successfully", async () => {
        const mockReviews: ProductReview[] = [
            {
                model: "testModel",
                score: 5,
                comment: "Excellent!",
                user: "John Doe", // Changed to a string representing the username
                date: "2023-01-01"
            },
            {
                model: "testModel",
                score: 4,
                comment: "Good, but could be better",
                user: "Jane Doe", // Changed to a string representing the username
                date: "2023-01-02"
            }
        ];

        jest.spyOn(ReviewController.prototype, "getProductReviews").mockResolvedValueOnce(mockReviews);

        const response = await request(app).get("/reviews/testModel");
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockReviews);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith("testModel");
    });

    test("It should handle errors when retrieving reviews fails", async () => {
        const model = "testModel";
        const errorMessage = "Error retrieving reviews";
        jest.spyOn(ReviewController.prototype, "getProductReviews").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).get(`/reviews/${model}`);
        expect(response.status).toBe(500); // Assuming your error handler sets status to 500 on errors
        expect(response.text).toContain(errorMessage);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.getProductReviews).toHaveBeenCalledWith(model);
    });

    test("It should delete a review successfully", async () => {
        jest.spyOn(ReviewController.prototype, "deleteReview").mockResolvedValueOnce(undefined);

        const response = await request(app).delete("/reviews/testModel");
        expect(response.status).toBe(200);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith("testModel", undefined);
    });

    test("It should handle errors when deleting a review fails", async () => {
        const model = "testModel";
        const errorMessage = "Error deleting review";
        jest.spyOn(ReviewController.prototype, "deleteReview").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete(`/reviews/${model}`);
        expect(response.status).toBe(500); // Assuming your error handler sets status to 500 on errors
        expect(response.text).toContain(errorMessage);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReview).toHaveBeenCalledWith(model, undefined); // Adjust according to actual expected behavior
    });

    test("It should delete all reviews of a product successfully", async () => {
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockResolvedValueOnce(undefined);

        const response = await request(app).delete("/reviews/testModel/all");
        expect(response.status).toBe(200);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith("testModel");
    });

    test("It should handle errors when deleting all reviews of a product fails", async () => {
        const model = "testModel";
        const errorMessage = "Error deleting all reviews of the product";
        jest.spyOn(ReviewController.prototype, "deleteReviewsOfProduct").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete(`/reviews/${model}/all`);
        expect(response.status).toBe(500); // Assuming your error handler sets status to 500 on errors
        expect(response.text).toContain(errorMessage);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledTimes(1);
        expect(ReviewController.prototype.deleteReviewsOfProduct).toHaveBeenCalledWith(model);
    });

    test("It should delete all reviews successfully", async () => {
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockResolvedValueOnce(undefined);

        const response = await request(app).delete("/reviews/");
        expect(response.status).toBe(200);
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    });

    test("It should handle errors when deleting all reviews fails", async () => {
        const errorMessage = "Error deleting all reviews";
        jest.spyOn(ReviewController.prototype, "deleteAllReviews").mockRejectedValueOnce(new Error(errorMessage));
    
        const response = await request(app).delete("/reviews/");
        expect(response.status).toBe(500); // Assuming your error handler sets status to 500 on errors
        expect(response.text).toContain(errorMessage);
        expect(ReviewController.prototype.deleteAllReviews).toHaveBeenCalledTimes(1);
    });
});

