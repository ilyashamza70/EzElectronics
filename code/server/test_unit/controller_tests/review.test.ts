import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import ReviewController from "../../src/controllers/reviewController";
import ReviewDAO from "../../src/dao/reviewDAO";
import { Role, User } from "../../src/components/user";
import { ExistingReviewError, NoReviewProductError } from "../../src/errors/reviewError";
import { ProductNotFoundError } from "../../src/errors/productError";
import { afterEach } from "node:test";

jest.mock("../../src/dao/reviewDAO");

describe('ReviewController', () => {
    let reviewController: ReviewController;
    let user: User;

    beforeEach(() => {
        reviewController = new ReviewController();
        user = {
            username: "User",
            name: "User",
            surname: "User",
            role: Role.CUSTOMER,
            address: "piazza",
            birthdate: "1999-18-12" 
        };
        jest.spyOn(console, 'error').mockImplementation(() => {});
        jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('addReview calls ReviewDAO.addReview with correct parameters', async () => {
        const addReviewSpy = jest.spyOn(ReviewDAO.prototype, 'addReview').mockResolvedValue();
        const date = new Date().toISOString(); 

        await reviewController.addReview("iphone", user, 5, "Good");

        expect(addReviewSpy).toHaveBeenCalledTimes(1);
        expect(addReviewSpy).toHaveBeenLastCalledWith(
            "iphone",
            user.username,
            5,
            "Good",
            expect.any(String) 
        );
    });

    test('addReview should throw error if model is empty', async () => {
        await expect(reviewController.addReview("", user, 5, "Great")).rejects.toThrow("Model parameter cannot be empty.");
    });

    test('addReview should throw error if score is out of range', async () => {
        await expect(reviewController.addReview("iphone", user, 0, "Good")).rejects.toThrow("Score must be between 1 and 5.");
        await expect(reviewController.addReview("iphone", user, 6, "Good")).rejects.toThrow("Score must be between 1 and 5.");
    });
    test('addReview should throw error if comment is null', async () => {
        await expect(reviewController.addReview("iphone", user, 5, "")).rejects.toThrow("Comment cannot be null.");
    });

    test('addReview should add a review successfully', async () => {
        const addSpy = jest.spyOn(ReviewDAO.prototype, 'addReview').mockResolvedValue(undefined);
        await reviewController.addReview("iphone", user, 5, "Excellent product");
        await reviewController.addReview("iphone", user, 5, "Excellent product");

        expect(addSpy).toHaveBeenCalledWith("iphone", "User", 5, "Excellent product", expect.any(String));
    });

    test('addReview should handle ExistingReviewError', async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(new ExistingReviewError());

        await expect(reviewController.addReview("iphone", user, 5, "Excellent product"))
            .rejects
            .toThrow(ExistingReviewError);
    });

    test('addReview should handle ProductNotFound', async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(new ProductNotFoundError());

        await expect(reviewController.addReview("iphone", user, 5, "Excellent product"))
            .rejects
            .toThrow(ProductNotFoundError);
    });

    test('addReview should handle productNotFoundError', async () => {
        jest.spyOn(ReviewDAO.prototype, 'addReview').mockRejectedValue(new ProductNotFoundError());

        await expect(reviewController.addReview("iphone", user, 5, "Excellent product"))
            .rejects
            .toThrow(ProductNotFoundError);
    });

    test('getProductReviews calls ReviewDAO.getProductReviews with correct parameters', async () => {
        const getProductReviewsSpy = jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockResolvedValue([]);
        const model = "iphone";
    
        const reviews = await reviewController.getProductReviews(model);
    
        expect(getProductReviewsSpy).toHaveBeenCalledTimes(1);
        expect(getProductReviewsSpy).toHaveBeenLastCalledWith(model);
    });

    test('getProductReviews should throw error if model is empty', async () => {
        await expect(reviewController.getProductReviews("")).rejects.toThrow("Model parameter cannot be empty.");
    });
    
    test('getProductReviews should handle errors gracefully', async () => {
        jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockRejectedValue(new Error("Database error"));
        await expect(reviewController.getProductReviews("iphone")).rejects.toThrow("Database error");
    });

    test('getProductReviews should retrieve reviews', async () => {
        const mockReviews = [{ model: "iphone", username: "User", score: 5, comment: "Great!", user: user.username, date: new Date().toISOString() }];
        jest.spyOn(ReviewDAO.prototype, 'getProductReviews').mockResolvedValue(mockReviews);

        const reviews = await reviewController.getProductReviews("iphone");

        expect(reviews).toEqual(mockReviews);
    });

    test('deleteReview calls ReviewDAO.deleteReview with correct parameters', async () => {
        const deleteReviewSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockResolvedValue();
    
        await reviewController.deleteReview("iphone", user);
    
        expect(deleteReviewSpy).toHaveBeenCalledTimes(1);
        expect(deleteReviewSpy).toHaveBeenLastCalledWith(
            "iphone",
            user.username
        );
    });
    
    test('deleteReview should throw error if model is empty', async () => {
        await expect(reviewController.deleteReview("", user)).rejects.toThrow("Model parameter cannot be empty.");
    });

    test('deleteReview should delete a review', async () => {
        const deleteSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockResolvedValue(undefined);
        await reviewController.deleteReview("iphone", user);

        expect(deleteSpy).toHaveBeenCalledWith("iphone", "User");
    });

    test('deleteReview should handle NoReviewProductError', async () => {
        jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockRejectedValue(new NoReviewProductError());
        await expect(reviewController.deleteReview ("iphone",user)).rejects.toThrow(NoReviewProductError);
    });

    test('deleteReview should handle unexpected errors gracefully', async () => {
        const unexpectedError = new Error("Unexpected database error");
        const deleteReviewSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReview').mockRejectedValue(unexpectedError);
        await expect(reviewController.deleteReview("iphone", user)).rejects.toThrow("Internal Server Error");
        deleteReviewSpy.mockRestore();
    });

    test('deleteReviewsOfProduct calls ReviewDAO.deleteReviewsOfProduct with correct parameters', async () => {
        const deleteReviewsOfProductSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockResolvedValue();
        const model = "iphone";
    
        await reviewController.deleteReviewsOfProduct(model);
    
        expect(deleteReviewsOfProductSpy).toHaveBeenCalledTimes(1);
        expect(deleteReviewsOfProductSpy).toHaveBeenLastCalledWith(model);
    });

    test('deleteReviewsOfProduct should throw error if model is empty', async () => {
        await expect(reviewController.deleteReviewsOfProduct("")).rejects.toThrow("Model parameter cannot be empty.");
    });

    test('deleteReviewsOfProduct should delete all reviews for a product', async () => {
        const deleteAllSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockResolvedValue(undefined);
        await reviewController.deleteReviewsOfProduct("iphone");
    
        expect(deleteAllSpy).toHaveBeenCalledWith("iphone");
    });

    test('deleteReviewsOfProduct should handle unexpected errors gracefully', async () => {
        const unexpectedError = new Error("Unexpected database error");
        const deleteReviewSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockRejectedValue(unexpectedError);
        await expect(reviewController.deleteReviewsOfProduct("iphone")).rejects.toThrow("Internal Server Error");
        deleteReviewSpy.mockRestore();
    });

    test('deleteReviewsOfProduct should handle ProductNotFoundError', async () => {
        const customMessage = "Product not found for deletion";
        const productNotFoundError = new ProductNotFoundError();
        productNotFoundError.customMessage = customMessage;
        jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockRejectedValue(productNotFoundError);
        await expect(reviewController.deleteReviewsOfProduct("iphone")).rejects.toThrow(ProductNotFoundError);
    });
    
    test('deleteAllReviews calls ReviewDAO.deleteAllReviews with correct parameters', async () => {
        const deleteAllReviewsSpy = jest.spyOn(ReviewDAO.prototype, 'deleteAllReviews').mockResolvedValue();
    
        await reviewController.deleteAllReviews();
    
        expect(deleteAllReviewsSpy).toHaveBeenCalledTimes(1);
        expect(deleteAllReviewsSpy).toHaveBeenCalledWith(); // No parameters expected
    });

    test('deleteAllReviews should handle unexpected errors gracefully', async () => {
        const unexpectedError = new Error("Unexpected database error");
        const deleteReviewSpy = jest.spyOn(ReviewDAO.prototype, 'deleteReviewsOfProduct').mockRejectedValue(unexpectedError);
        await expect(reviewController.deleteReviewsOfProduct("iphone")).rejects.toThrow("Internal Server Error");
        deleteReviewSpy.mockRestore();
    });
    
    test('deleteAllReviews should delete all reviews from the database', async () => {
        const deleteAllSpy = jest.spyOn(ReviewDAO.prototype, 'deleteAllReviews').mockResolvedValue(undefined);
        await reviewController.deleteAllReviews();
    
        expect(deleteAllSpy).toHaveBeenCalled();
    });
});