import db from "../db/db";
import { ProductReview } from "../components/review";
import { ExistingReviewError, NoReviewProductError } from "../errors/reviewError";
import { ProductNotFoundError } from "../errors/productError";

class ReviewDAO {
    async addReview(model: string, username: string, score: number, date: string, comment: string): Promise<void> {
        if (!model) {
            throw new NoReviewProductError(); 
        }
        try {
            const checkProductSql = "SELECT COUNT(*) AS count FROM products WHERE model = ?";
            const row = await new Promise<any>((resolve, reject) => {
                db.get(checkProductSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(new Error("Error checking product existence: " + err.message));
                        return;
                    }
                    resolve(row);
                });
            });
            if (row.count === 0) {
                throw new ProductNotFoundError();
            }

            const checkReviewSql = "SELECT COUNT(*) AS count FROM ProductReviews WHERE model = ? AND user = ?";
            const reviewRow = await new Promise<any>((resolve, reject) => {
                db.get(checkReviewSql, [model, username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(new Error("Error checking review existence: " + err.message));
                        return;
                    }
                    resolve(row);
                });
            });
            if (reviewRow.count > 0) {
                throw new ExistingReviewError();
            }

            const sql = "INSERT INTO ProductReviews(model, user, score, comment, date) VALUES(?, ?, ?, ?, ?)";
            await new Promise<void>((resolve, reject) => {
                db.run(sql, [model, username, score, date, comment], (err: Error | null) => {
                    if (err) {
                        reject(new Error("Error adding review: " + err.message));
                        return;
                    }
                    resolve();
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async getProductReviews(model: string | null): Promise<ProductReview[]> {
        if (model === null || model === "") {
            throw new NoReviewProductError(); // 
        }
        try {
            const checkProductSql = "SELECT COUNT(*) AS count FROM products WHERE model = ?";
            const productRow = await new Promise<any>((resolve, reject) => {
                db.get(checkProductSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(new Error("Error checking product existence: " + err.message));
                        return;
                    }
                    resolve(row);
                });
            });
            if (productRow.count === 0) {
                throw new ProductNotFoundError();
            }
            
            const sql = "SELECT model, user, score, comment, date FROM ProductReviews WHERE model = ?";
            const rows = await new Promise<any[]>((resolve, reject) => {
                db.all(sql, [model], (err: Error | null, rows: any[]) => {
                    if (err) {
                        reject(new Error("Error fetching product reviews: " + err.message));
                        return;
                    }
                    resolve(rows);
                });
            });
            return rows.map(row => new ProductReview(row.model, row.user, row.score, row.date, row.comment));
        } catch (error) {
            throw error;
        }
    }

    async deleteReview(model: string, username: string): Promise<void> {
        if (!model) {
            throw new NoReviewProductError(); // 
        }
        try {
            const checkProductSql = "SELECT COUNT(*) AS count FROM products WHERE model = ?";
            const productRow = await new Promise<any>((resolve, reject) => {
                db.get(checkProductSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(new Error("Error checking product existence: " + err.message));
                        return;
                    }
                    resolve(row);
                });
            });
            if (productRow.count === 0) {
                throw new ProductNotFoundError();
            }
            
            const checkReviewSql = "SELECT COUNT(*) AS count FROM ProductReviews WHERE model = ? AND user = ?";
            const row = await new Promise<any>((resolve, reject) => {
                db.get(checkReviewSql, [model, username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(new Error("Error checking review existence: " + err.message));
                        return;
                    }
                    resolve(row);
                });
            });
            if (row.count === 0) {
                throw new NoReviewProductError();
            }

            const sql = "DELETE FROM ProductReviews WHERE model = ? AND user = ?";
            await new Promise<void>((resolve, reject) => {
                db.run(sql, [model, username], (err: Error | null) => {
                    if (err) {
                        reject(new Error("Error deleting review: " + err.message));
                        return;
                    }
                    resolve();
                });
            });
        } catch (error) {
            throw error;
        }
    }
    
    async deleteReviewsOfProduct(model: string): Promise<void> {
        try {
            const checkProductSql = "SELECT COUNT(*) AS count FROM products WHERE model = ?";
            const row = await new Promise<any>((resolve, reject) => {
                db.get(checkProductSql, [model], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
            if (row.count === 0) {
                throw new ProductNotFoundError();
            }
            const sql = "DELETE FROM ProductReviews WHERE model = ?";
            await new Promise<void>((resolve, reject) => {
                db.run(sql, [model], (err: Error | null) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        } catch (error) {
            throw error;
        }
    }

    async deleteAllReviews(): Promise<void> {
        try {
            const sql = "DELETE FROM ProductReviews";
            await new Promise<void>((resolve, reject) => {
                db.run(sql, (err: Error | null) => {
                    if (err) {
                        reject(new Error("Error deleting all reviews: " + err.message));
                        return;
                    }
                    resolve();
                });
            });
        } catch (error) {
            throw error;
        }
    }
}

export default ReviewDAO;
