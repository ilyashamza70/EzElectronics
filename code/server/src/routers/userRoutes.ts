import express, { Router } from "express"
import Authenticator from "./auth"
import { body, param } from "express-validator"
import { User } from "../components/user"
import ErrorHandler from "../helper"
import UserController from "../controllers/userController"

/**
 * Represents a class that defines the routes for handling users.
 */
class UserRoutes {
    private router: Router
    private authService: Authenticator
    private errorHandler: ErrorHandler
    private controller: UserController

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.router = express.Router()
        this.errorHandler = new ErrorHandler()
        this.controller = new UserController()
        this.initRoutes()
    }

    /**
     * Get the router instance.
     * @returns The router instance.
     */
    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the routes for the user router.
     * 
     * @remarks
     * This method sets up the HTTP routes for creating, retrieving, updating, and deleting user data.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for creating a user.
         * It does not require authentication.
         * It requires the following parameters:
         * - username: string. It cannot be empty and it must be unique (an existing username cannot be used to create a new user)
         * - name: string. It cannot be empty.
         * - surname: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * - role: string (one of "Manager", "Customer")
         * It returns a 200 status code.
         */
        this.router.post(
            "/",
            (req: any, res: any, next: any) => this.controller.createUser(req.body.username, req.body.name, req.body.surname, req.body.password, req.body.role)
                .then(() => res.status(200).end())
                .catch((err) => {
                    next(err)
                })
        )

        /**
         * Route for retrieving all users.
         * It does not require authentication.
         * It returns an array of users.
         * This route is only for testing purposes (allows to retrieve all users without any authentication or authorization checks)
         */
        this.router.get(
            "/",
            (req: any, res: any, next: any) => this.controller.getUsers()
                .then((users: any) => res.status(200).json(users))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving all users of a specific role.
         * It does not require authentication.
         * It expects the role of the users in the request parameters: the role must be one of ("Manager", "Customer").
         * It returns an array of users.
         * This route is only for testing purposes (allows to retrieve all users of a specific role without any authentication or authorization checks)
         */
        this.router.get(
            "/roles/:role",
            (req: any, res: any, next: any) => this.controller.getUsersByRole(req.params.role)
                .then((users: any) => res.status(200).json(users))
                .catch((err) => next(err))
        )

        /**
         * Route for retrieving a user by its username.
         * It does not require authentication.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns the user.
         * This route is only for testing purposes (allows to retrieve a user by its username without any authentication or authorization checks)
         */
        this.router.get(
            "/:username",
            (req: any, res: any, next: any) => this.controller.getUserByUsername(req.params.username)
                .then((user: any) => res.status(200).json(user))
                .catch((err) => next(err))
        )

        /**
         * Route for deleting a user.
         * It does not require authentication.
         * It expects the username of the user in the request parameters: the username must represent an existing user.
         * It returns a 200 status code.
         * This route is only for testing purposes (allows to delete a user by its username without any authentication or authorization checks)
         */
        this.router.delete(
            "/:username",
            (req: any, res: any, next: any) => this.controller.deleteUser(req.params.username)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for deleting all users.
         * It does not require authentication.
         * It returns a 200 status code.
         * This route is only for testing purposes (allows to delete all users and have an empty database).
         */
        this.router.delete(
            "/",
            (req: any, res: any, next: any) => this.controller.deleteAll()
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

    }
}

/**
 * Represents a class that defines the authentication routes for the application.
 */
class AuthRoutes {
    private router: Router
    private errorHandler: ErrorHandler
    private authService: Authenticator

    /**
     * Constructs a new instance of the UserRoutes class.
     * @param authenticator - The authenticator object used for authentication.
     */
    constructor(authenticator: Authenticator) {
        this.authService = authenticator
        this.errorHandler = new ErrorHandler()
        this.router = express.Router();
        this.initRoutes();
    }

    getRouter(): Router {
        return this.router
    }

    /**
     * Initializes the authentication routes.
     * 
     * @remarks
     * This method sets up the HTTP routes for login, logout, and retrieval of the logged in user.
     * It can (and should!) apply authentication, authorization, and validation middlewares to protect the routes.
     */
    initRoutes() {

        /**
         * Route for logging in a user.
         * It does not require authentication.
         * It expects the following parameters:
         * - username: string. It cannot be empty.
         * - password: string. It cannot be empty.
         * It returns an error if the username represents a non-existing user or if the password is incorrect.
         * It returns the logged in user.
         */
        this.router.post(
            "/",
            (req, res, next) => this.authService.login(req, res, next)
                .then((user: User) => res.status(200).json(user))
                .catch((err: any) => { res.status(401).json(err) })
        )

        /**
         * Route for logging out the currently logged in user.
         * It requires the user to be logged in.
         * It returns a 200 status code.
         */
        this.router.delete(
            "/current",
            (req, res, next) => this.authService.logout(req, res, next)
                .then(() => res.status(200).end())
                .catch((err: any) => next(err))
        )

        /**
         * Route for retrieving the currently logged in user.
         * It requires the user to be logged in.
         * It returns the logged in user.
         */
        this.router.get(
            "/current",
            (req: any, res: any) => res.status(200).json(req.user)
        )
    }
}

export { UserRoutes, AuthRoutes }