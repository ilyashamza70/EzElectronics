import { User } from "../components/user"
import UserDAO from "../dao/userDAO"

/**
 * Represents a controller for managing users.
 * All methods of this class must interact with the corresponding DAO class to retrieve or store data.
 */
class UserController {
    private dao: UserDAO

    constructor() {
        this.dao = new UserDAO
    }

    /**
     * Creates a new user.
     * @param username - The username of the new user. It must not be null and it must not be already taken.
     * @param name - The name of the new user. It must not be null.
     * @param surname - The surname of the new user. It must not be null.
     * @param password - The password of the new user. It must not be null.
     * @param role - The role of the new user. It must not be null and it can only be one of the two allowed types ("Manager", "Customer")
     * @returns A Promise that resolves to true if the user has been created.
     */
    async createUser(username: string, name: string, surname: string, password: string, role: string) { }

    /**
     * Returns all users.
     * @returns A Promise that resolves to an array of users.
     */
    async getUsers() { }

    /**
     * Returns all users with a specific role.
     * @param role - The role of the users to retrieve. It can only be one of the two allowed types ("Manager", "Customer")
     * @returns A Promise that resolves to an array of users with the specified role.
     */
    async getUsersByRole(role: string) {

    }

    /**
     * Returns a specific user.
     * @param username - The username of the user to retrieve. The user must exist.
     * @returns A Promise that resolves to the user with the specified username.
     */
    async getUserByUsername(username: string) {

    }

    /**
     * Deletes a specific user
     * @param username - The username of the user to delete. The user must exist.
     * @returns A Promise that resolves to true if the user has been deleted.
     */
    async deleteUser(username: string) {

    }

    /**
     * Deletes all users
     * @returns A Promise that resolves to true if all users have been deleted.
     */
    async deleteAll() {

    }
}

export default UserController