/**
 * Represents a user in the system.
 */
class User {
    username: string
    name: string
    surname: string
    role: Role

    /**
     * Creates a new instance of the User class.
     * @param username - The username of the user. This is unique for each user.
     * @param name - The name of the user.
     * @param surname - The surname of the user.
     * @param role - The role of the user. This can be "Manager" or "Customer".
     */
    constructor(username: string, name: string, surname: string, role: Role) {
        this.username = username
        this.name = name
        this.surname = surname
        this.role = role
    }
}

/**
 * Represents the role of a user.
 * The values present in this enum are the only valid values for the role of a user.
 */
enum Role {
    MANAGER = "Manager",
    CUSTOMER = "Customer"
}

export { User, Role }