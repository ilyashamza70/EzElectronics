const USER_NOT_FOUND = "The specified user does not exist"
const USER_NOT_MANAGER = "This operation can be performed only by a manager"
const USER_ALREADY_EXISTS = "The chosen username already exists"
const USER_NOT_CUSTOMER = "This operation can be performed only by a customer"
const USER_NOT_ADMIN = "This operation can be performed only by an admin"
const USER_IS_ADMIN = "Admins cannot be deleted"
const UNAUTHORIZED_USER = "You cannot access the information of other users"
const USER_NOT_BORN = "The chosen Birth date is out of bound, Date must be in the past!"
/**
 * Represents an error that occurs when a user is not found.
 */
class UserNotFoundError extends Error {
    customMessage: string
    customCode: number

    constructor() {
        super()
        this.customMessage = USER_NOT_FOUND
        this.customCode = 404
    }
}

/**
 * Represents an error that occurs when a user is not a manager.
 */
class UserNotManagerError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_MANAGER
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a user is not a customer.
 */
class UserNotCustomerError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_CUSTOMER
        this.customCode = 401
    }
}



/**
 * Represents an error that occurs when a username is already in use.
 */
class UserAlreadyExistsError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_ALREADY_EXISTS
        this.customCode = 409
    }
}

/**
 * Represents an error that occurs when a user is not an admin.
 */
class UserNotAdminError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_ADMIN
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a selected birthdate is after current date.
 */
class UserBirthDateError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_NOT_BORN
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a user is an admin.
 */
class UserIsAdminError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = USER_IS_ADMIN
        this.customCode = 401
    }
}

/**
 * Represents an error that occurs when a user doesn't have permission to do specific instance.
 */
class UnauthorizedUserError extends Error {
    customMessage: String;
    customCode: Number;

    constructor() {
        super()
        this.customMessage = UNAUTHORIZED_USER
        this.customCode = 401
    }
}

export { UserNotFoundError, UserNotManagerError, UserNotCustomerError, UserAlreadyExistsError, UserNotAdminError, UserBirthDateError, UserIsAdminError, UnauthorizedUserError }