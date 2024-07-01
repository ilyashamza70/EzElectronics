import { ProductReview } from "../components/review";
import { User } from "../components/user";
import ReviewDAO from "../dao/reviewDAO";
import { ExistingReviewError, NoReviewProductError } from '../errors/reviewError';
import { ProductNotFoundError } from "../errors/productError";

class ReviewController {
    private dao: ReviewDAO

    constructor() {
        this.dao = new ReviewDAO();
    }

    async addReview(model: string, user: User, score: number, comment: string): Promise<void> {
        if (!model) {
            throw new Error("Model parameter cannot be empty.");
        }
        if (score < 1 || score > 5) {
            throw new Error("Score must be between 1 and 5.");
        }
        if (!comment) {
            throw new Error("Comment cannot be null.");
        }
    
        try {
            const date = new Date().toISOString().split('T')[0]; 
            console.log(`Attempting to add review: model=${model}, user=${user.username}, score=${score}, comment=${comment}`);
            
            await this.dao.addReview(model, user.username, score, comment, date);
            console.log(`Review added successfully for model ${model} by user ${user.username}`);
            
        } catch (error) {
            if (error instanceof ExistingReviewError || error instanceof ProductNotFoundError) {
                throw error;
            } else {
                throw new Error("Internal Server Error"); 
            }
        }
    }
    

    async getProductReviews(model: string): Promise<ProductReview[]> {
        if (!model) {
            throw new Error("Model parameter cannot be empty.");
        }
        try {
            return await this.dao.getProductReviews(model);
        } catch (error) {
            throw error;
        }
    }

    async deleteReview(model: string, user: User): Promise<void> {
        if (!model) {
            throw new Error("Model parameter cannot be empty.");
        }
        try {
            await this.dao.deleteReview(model, user.username);
        } catch (error) {
            if (error instanceof ProductNotFoundError) {
                throw error;
            } else if(error instanceof NoReviewProductError) {
                throw error;
            } else {
                throw new Error("Internal Server Error");
            }
        }
    }

    async deleteReviewsOfProduct(model: string): Promise<void> {
        if (!model) {
            throw new Error("Model parameter cannot be empty.");
        }
        try {
            await this.dao.deleteReviewsOfProduct(model);
        } catch (error) {
            if(error instanceof ProductNotFoundError) {
                throw error;
            } else {
                throw new Error("Internal Server Error");
            }
        }
    }

    async deleteAllReviews(): Promise<void> {
        try {
            await this.dao.deleteAllReviews();
        } catch (error) {
            throw new Error("Internal Server Error");
        }
    }
}

export default ReviewController;
