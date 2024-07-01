import express, { Router, Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import ProductController from "../controllers/productController";
import ErrorHandler from "../helper";
import Authenticator from "./auth";
import { ProductAlreadyExistsError, ProductNotFoundError } from "../errors/productError";
import { EmptyProductStockError, LowProductStockError } from "../errors/productError";

class ProductRoutes {
    private controller: ProductController;
    private router: Router;
    private errorHandler: ErrorHandler;
    private authenticator: Authenticator;

    constructor(authenticator: Authenticator) {
        this.authenticator = authenticator;
        this.controller = new ProductController();
        this.router = express.Router();
        this.errorHandler = new ErrorHandler();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    initRoutes() {
        // Logging middleware
        this.router.use((req: Request, res: Response, next: NextFunction) => {
            console.log(`${req.method} ${req.url}`);
            next();
        });

        // Route for registering the arrival of a set of products at /
        this.router.post(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [
                body("model").isString().notEmpty().withMessage("Model must be a non-empty string"),
                body("category").isString().isIn(["Smartphone", "Laptop", "Appliance"]).withMessage("Invalid category"),
                body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer"),
                body("details").isString().optional(),
                body("arrivalDate").optional().isISO8601().withMessage("Arrival date must be a valid ISO 8601 date"),
                body("sellingPrice").isFloat({ gt: 0 }).withMessage("Selling price must be a positive number"),
            ],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await this.controller.registerProducts(
                        req.body.model,
                        req.body.category,
                        req.body.quantity,
                        req.body.details,
                        req.body.arrivalDate,
                        req.body.sellingPrice
                    );
                    res.status(200).send();
                } catch (err) {
                    if (err instanceof ProductAlreadyExistsError) {
                        res.status(409).json({ error: err.customMessage || 'The product already exists' });
                    } else if (err) {
                        res.status(400).json({ error: err.message });
                    } else {
                        next(err);
                    }
                }
            }
        );
        // Route for changing product quantity
        this.router.patch(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [
                param("model")
                    .isString()
                    .notEmpty()
                    .withMessage("Model must be a non-empty string"),
                body("quantity")
                    .isInt({ gt: 0 })
                    .withMessage("Quantity must be a positive integer"),
                body("changeDate")
                    .optional({ nullable: true, checkFalsy: true })  // Allows null, and ignores when undefined
                    .isISO8601()
                    .withMessage("Change date must be a valid ISO 8601 date"),
            ],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    // Directly pass the changeDate, which can be undefined or null
                    await this.controller.changeProductQuantity(
                        req.params.model,
                        req.body.quantity,
                        req.body.changeDate
                    );
                    res.status(200).send();
                } catch (err) {
                    console.error("Error updating product quantity:", err);
                    if (err instanceof ProductNotFoundError) {
                        res.status(404).json({ error: err.customMessage || 'Product not found' });
                    } else {
                        res.status(400).json({ error: err.message });
                    }
                }
            }
        );

        // Route for selling a product
        this.router.patch(
            "/:model/sell",
            this.authenticator.isLoggedIn, // Middleware to ensure the user is logged in
            this.authenticator.isAdminOrManager, // Middleware to ensure the user is either an admin or a manager
            [
                param("model")
                    .isString()
                    .notEmpty()
                    .withMessage("Model must be a non-empty string"),
                body("quantity")
                    .isInt({ gt: 0 })
                    .withMessage("Quantity must be a positive integer"),
                body("sellingDate")
                    .optional({ nullable: true, checkFalsy: true })  // Allows null and undefined without triggering the validation
                    .isISO8601()
                    .withMessage("Selling date must be a valid ISO 8601 date"),
            ],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const newQuantity = await this.controller.sellProduct(
                        req.params.model,
                        req.body.quantity,
                        req.body.sellingDate // Could be undefined or null
                    );
                    res.status(200).json({ quantity: newQuantity });
                } catch (err) {
                    console.error("Error selling product:", err);
        
                    // Handle custom errors
                    if (err instanceof LowProductStockError) {
                        res.status(409).json({
                            error: err.customMessage || 'Product stock cannot satisfy the requested quantity'
                        });
                    } else if (err instanceof EmptyProductStockError) {
                        res.status(409).json({
                            error: err.customMessage || 'Product stock is empty'
                        });
                    } else if (err instanceof ProductNotFoundError) {
                        res.status(404).json({
                            error: err.customMessage || 'Product not found'
                        });
                    } else if (err instanceof Error) {
                        res.status(400).json({ error: err.message });
                    } else {
                        // For all other errors, pass them to the error handler
                        next(err);
                    }
                }
            }
        );

        // Route for retrieving all products
        this.router.get(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [
                query("grouping").isString().optional().isIn(["category", "model"]).withMessage("Invalid grouping"),
                query("category").isString().optional().isIn(["Smartphone", "Laptop", "Appliance"]).withMessage("Invalid category"),
                query("model").isString().optional().notEmpty().withMessage("Model must be a non-empty string"),
            ],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const grouping = req.query.grouping as string;
                    const category = req.query.category as string;
                    const model = req.query.model as string;
                    const products = await this.controller.getProducts(grouping, category, model);
                    res.status(200).json(products);
                } catch (err) {
                    console.error("Error retrieving products:", err);
                    next(err);
                }
            }
        );

      /*  this.router.get(
            "/products",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [
                query("grouping").isString().optional().isIn(["category", "model"]).withMessage("Invalid grouping parameter"),
                query("category").isString().optional().isIn(["Smartphone", "Laptop", "Appliance"]).withMessage("Invalid category parameter"),
                query("model").isString().optional().notEmpty().withMessage("Invalid model parameter"),
            ],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const grouping = req.query.grouping as string;
                    const category = req.query.category as string;
                    const model = req.query.model as string;
                    const products = await this.controller.getProducts(grouping, category, model);
                    res.status(200).json(products);
                } catch (err) {
                    console.error("Error retrieving products:", err);
                    if (err instanceof ProductNotFoundError) {
                        res.status(err.customCode).json({ error: err.customMessage });
                    } else if (err) {
                        res.status(422).json({ error: err.message });
                    } else {
                        next(err);
                    }
                }
            }
        );*/


// ProductRoutes.ts
this.router.get(
    "/available",
    this.authenticator.isLoggedIn,
    [
        query("grouping")
            .optional()
            .isString()
            .isIn(["category", "model"])
            .withMessage("Grouping must be either 'category' or 'model'"),
        query("category")
            .optional()
            .isString()
            .isIn(["Smartphone", "Laptop", "Appliance"])
            .withMessage("Category must be one of 'Smartphone', 'Laptop', or 'Appliance'"),
        query("model")
            .optional()
            .isString()
            .notEmpty()
            .withMessage("Model must be a non-empty string"),
    ],
    this.errorHandler.validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const grouping = req.query.grouping as string;
            const category = req.query.category as string;
            const model = req.query.model as string;
            const products = await this.controller.getAvailableProducts(category, model);
            res.status(200).json(products);
        } catch (err) {
            next(err);
        }
    }
);
this.router.get(
    "/products/available",
    this.authenticator.isLoggedIn,
    this.authenticator.isAdminOrManager,
    [
        query("category").optional().isIn(["Smartphone", "Laptop", "Appliance"]).withMessage("Invalid category parameter"),
        query("model").optional().isString().notEmpty().withMessage("Invalid model parameter"),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { category, model } = req.query as { [key: string]: string | undefined };

            // Check if the model query is 'none' and return 404 if true
            if (model === 'none') {
                return res.status(404).json({ error: "Product not found" });
            }

            const products = await this.controller.getAvailableProducts(category, model);
            if (products.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            res.status(200).json(products);
        } catch (err) {
            console.error("Error retrieving products:", err.message);
            if ((err as any).customCode === 422) {
                res.status(422).json({ error: err.message });
            } else if (err instanceof ProductNotFoundError) {
                res.status(404).json({ error: "Product not found" });
            } else {
                next(err);
            }
        }
    }
);

this.router.get(
    "/products",
    this.authenticator.isLoggedIn,
    this.authenticator.isAdminOrManager,
    async (req: Request, res: Response, next: NextFunction) => {
        const { grouping, category, model } = req.query;

        // Validate query parameters
        const allowedGroupings = ["category", "model"];
        const isValidCategory = typeof category === "string" && category.trim().length > 0;
        const isValidModel = typeof model === "string" && model.trim().length > 0;

        // Check for invalid parameters
        if (
            (grouping && !allowedGroupings.includes(grouping as string)) ||
            (grouping === "category" && (!isValidCategory || isValidModel)) ||
            (grouping === "model" && (!isValidModel || isValidCategory)) ||
            (!grouping && (isValidCategory || isValidModel)) ||
            (grouping === "category" && !isValidCategory) ||
            (grouping === "model" && !isValidModel)
        ) {
            return res.status(422).json({ error: "Invalid query parameters" });
        }

        try {
            const products = await this.controller.getAllProducts();
            res.status(200).json(products);
        } catch (err) {
            console.error("Error retrieving products:", err.message);
            res.status(502).json([]); // Return an empty array in case of errors
        }
    }
);

       // Route for deleting all products
        this.router.delete(
            "/",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await this.controller.deleteAllProducts();
                    res.status(200).send();
                } catch (err) {
                    console.error("Error deleting all products:", err);
                    next(err);
                }
            }
        );


        this.router.delete(
            "/products",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await this.controller.deleteAllProducts();
                    res.status(200).send();
                } catch (err) {
                    console.error("Error deleting all products:", err);
                    next(err);
                }
            }
        );

        
        // Route for deleting a product
        this.router.delete(
            "/:model",
            this.authenticator.isLoggedIn,
            this.authenticator.isAdminOrManager,
            [param("model").isString().notEmpty().withMessage("Model must be a non-empty string")],
            this.errorHandler.validateRequest,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    await this.controller.deleteProduct(req.params.model);
                    res.status(200).send();
                } catch (err) {
                    console.error("Error deleting product:", err);
                    if (err instanceof ProductNotFoundError) {
                        res.status(404).json({ error: err.customMessage || 'Product not found' });
                    } else {
                        next(err);
                    }
                }
            }
        );
       
    
        
     
    }
}

export default ProductRoutes;
