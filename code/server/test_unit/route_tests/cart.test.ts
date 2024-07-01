import { test, describe, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { UserRoutes } from "../../src/routers/userRoutes";
import UserController from "../../src/controllers/userController";
import Authenticator from "../../src/routers/auth";
import UserDAO from '../../src/dao/userDAO';
import { User } from "../../src/components/user";


jest.mock("../../src/controllers/userController");
jest.mock("../../src/routers/auth");

const app = express();
app.use(express.json());

const mockAuthenticator = {
    isLoggedIn: (req: Request, res: Response, next: NextFunction) => next(),
    isManager: (req: Request, res: Response, next: NextFunction) => next(),
    isAdminOrManager: (req: Request, res: Response, next: NextFunction) => next(),
    isCustomer: (req: Request, res: Response, next: NextFunction) => next(),
} as unknown as Authenticator;

const userRoutes = new UserRoutes(mockAuthenticator);
app.use("/users", userRoutes.getRouter());

describe("UserRoutes tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("It should register a user successfully", async () => {
        const testUser = {
            username: "testUser",
            password: "testPassword",
            email: "test@example.com",
            role: "customer",
        };

        jest.spyOn(UserController.prototype,"createUser").mockResolvedValueOnce();

        const response = await request(app).post("/users/register").send(testUser);
        expect(response.status).toBe(200);
        expect(UserController.prototype.createUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.createUser).toHaveBeenCalledWith(
            testUser.username,
            testUser.password,
            testUser.email,
            testUser.role
        );
    });

    test("It should login a user successfully", async () => {
        const loginDetails = {
            username: "testUser",
            password: "testPassword",
        };

        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce({ token: "fakeToken" });

        const response = await request(app).post("/users/login").send(loginDetails);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ token: "fakeToken" });
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.getUsers).toHaveBeenCalledWith(
            loginDetails.username,
            loginDetails.password
        );
    });

    test("It should get user profile successfully", async () => {
        const testUser = {
            username: "testUser",
            email: "test@example.com",
            role: "customer",
        };

        jest.spyOn(UserController.prototype, "getUsers").mockResolvedValueOnce(testUser);

        const response = await request(app).get("/users/profile").send();
        expect(response.status).toBe(200);
        expect(response.body).toEqual(testUser);
        expect(UserController.prototype.getUsers).toHaveBeenCalledTimes(1);
    });

    test("It should update user profile successfully", async () => {
        const updateDetails = {
            email: "newtest@example.com",
        };

        jest.spyOn(UserController.prototype, "updateUserInfo").mockResolvedValueOnce();

        const response = await request(app).patch("/users/profile").send(updateDetails);
        expect(response.status).toBe(200);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.updateUserInfo).toHaveBeenCalledWith(updateDetails);
    });

    test("It should delete a user successfully", async () => {
        jest.spyOn(UserController.prototype, "deleteUser").mockResolvedValueOnce(true);

        const response = await request(app).delete("/users/testUser");
        expect(response.status).toBe(200);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledTimes(1);
        expect(UserController.prototype.deleteUser).toHaveBeenCalledWith("testUser");
    });
});