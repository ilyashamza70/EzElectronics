import db from "../db/db"
import { User } from "../components/user"
import crypto from "crypto"
import { UserAlreadyExistsError,UserNotLoggedIn,UserIsNotBorn, WrongInput, UserNotAdminError, UserNotFoundError } from "../errors/userError";
import { Role } from "../components/user";

/**
 * A class that implements the interaction with the database for all user-related operations.
 * You are free to implement any method you need here, as long as the requirements are satisfied.
 */
class UserDAO {
    
    /**
     * Checks whether the information provided during login (username and password) are correct.
     * @param username The username of the user.
     * @param plainPassword The password of the user (in plain text).
     * @returns A Promise that resolves to true if the user is authenticated, false otherwise.
     */
    getIsUserAuthenticated(username: string, plainPassword: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {

                const sql = "SELECT username, password, salt FROM users WHERE username = ?"
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) 
                        reject(err)
                    //If there is no user with the given username, or the user salt is not saved in the database, the user is not authenticated.
                    if (!row || row.username !== username || !row.salt) {
                        reject(new UserNotLoggedIn)
                        resolve(false)
                        return
                    } else {
                        //Hashes the plain password using the salt and then compares it with the hashed password stored in the database
                        const hashedPassword = crypto.scryptSync(plainPassword, row.salt, 16)
                        const passwordHex = Buffer.from(row.password, "hex")
                        if (!crypto.timingSafeEqual(passwordHex, hashedPassword)) resolve(false)
                        resolve(true)
                        return
                    }

                })
            } catch (error) {
                reject(error)
            }

        });
    }


    /**
     * Creates a new user and saves their information in the database
     * @param username The username of the user. It must be unique.
     * @param name The name of the user
     * @param surname The surname of the user
     * @param password The password of the user. It must be encrypted using a secure algorithm (e.g. scrypt, bcrypt, argon2)
     * @param role The role of the user. It must be one of the three allowed types ("Manager", "Customer", "Admin")
     * @returns A Promise that resolves to true if the user has been created.
     */
    createUser(username: string, name: string, surname: string, password: string, role: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const salt = crypto.randomBytes(16)
                const hashedPassword = crypto.scryptSync(password, salt, 16)
                const sql = "INSERT INTO users(username, name, surname, role, password, salt) VALUES(?, ?, ?, ?, ?, ?)"
                db.run(sql, [username, name, surname, role, hashedPassword, salt], (err: Error | null) => {
                    if (err) {
                        if (err.message.includes("UNIQUE constraint failed: users.username")) reject(new UserAlreadyExistsError)
                        //  Otherwise means some mistake in input missing or other check and modify
                        reject(err)
                        return
                       
                    }
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }

        })
    }
 
    /**
     * 
     * @returns The user if it exists
     */
    getUser(): Promise<User[]>{
        return new Promise<User[]>((resolve,rejects) => {
            try {
                const sql = "SELECT * FROM users"
                db.all(sql, (err: Error | null, rows: any[]) => {
                    if (err) {
                        rejects(err)
                        return
                    }
                    if (!rows || rows.length === 0) {
                        rejects(new UserNotFoundError())
                        return
                    }
                    const users: User[] = rows.map(row => new User(row.username, row.name, row.surname, row.role, row.address, row.birthdate))
                    resolve(users)
                })
            } catch (error) {
                rejects(error)
            }
        })
    }


    /**
     * Returns a user object from the database based on a custom username.
     * @param user The users Role
     * @returns A Promise that resolves the information of the requested users
     */
    getUsersByRole(role : Role) :Promise<User[]>{
        return new Promise<User[]>((resolve,rejects) => {
            try {
                const sql = "SELECT * FROM users WHERE role = ?"
                db.all(sql, [role], (err: Error | null, rows: any[]) => {
                    if (err) {
                        rejects(err)
                        return
                    }
                    if (!rows || rows.length === 0) {
                        rejects(new UserNotFoundError())
                        return
                    }
                    const users: User[] = rows.map(row => new User(row.username, row.name, row.surname, row.role, row.address, row.birthdate))
                    resolve(users)
                })
            } catch (error) {
                rejects(error)
            }
        })
    }
   
    /**
     * Returns a user object from the database based on a custom username.
     * @param user The user performing the action
     * @param name The new name of the user
     * @param surname The new surname of the user
     * @param address The new address of the user
     * @param birthdate The new birthdate of the user
     * @param username The username of the user to modify
     * @returns A Promise that resolves the information of the requested user
     */
    updateUserInfo(user: User, name: string, surname: string, address: string, birthdate: string, username: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            try {

                if (!name || name.trim() === '' || !surname || surname.trim() === '') {
                    reject(new WrongInput);
                    return;
                }
                const birthday = new Date(birthdate).setHours(0,0,0,0)
                const today = new Date().setHours(0,0,0,0)
                if(birthday > today) {
                    reject(new UserIsNotBorn())
                    return
                }
                const sql = "SELECT username, name, surname, role, address, birthdate FROM users WHERE username = ?"
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (!row) {
                        reject(new UserNotFoundError())
                        return
                    }
                    
                    if(row.role === Role.ADMIN && user.username != username){
                        reject(new UserNotAdminError())
                        return
                    }
                    const sql = "UPDATE users SET name = ?, surname = ?, address = ?, birthdate = ?  WHERE username = ?"
                    db.run(sql, [name,surname,address,birthdate,username], function (err) {
                        if(err){
                            reject(err)
                            return
                        }
                        const update_user = new User(row.username,name,surname,row.role,address,birthdate)
                        resolve(update_user);
                    })
                    })
            } catch (error) {
                reject(error)
            }

        })
    }

    
    /**
     * Returns a user object from the database based on the username.
     * @param username The username of the user to retrieve
     * @returns A Promise that resolves the information of the requested user
     */
    getUserByUsername(username: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {
            try {
                const sql = "SELECT * FROM users WHERE username = ?"
                db.get(sql, [username], (err: Error | null, row: any) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    if (!row) {
                        reject(new UserNotFoundError())
                        return
                    }
                    const user: User = new User(row.username, row.name, row.surname, row.role, row.address, row.birthdate)
                    resolve(user)
                })
            } catch (error) {
                reject(error)
            }

        })
    }
    /**
     * Deletes a user from database depending on the give username
     * Allows to remove a specified user and delete all his info
     * @param username The username of the user to delete
     * @returns A Promise resolving to true if user is eliminated, false otherwise
     */
    deleteUser(username: string): Promise<Boolean>{
        return new Promise<Boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM users WHERE username = ?"
                db.run(sql, [username], (err: Error | null) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }

        })
    }
    /**
     * Deletes all users from database except for admins
     * Allows you to purge completely the database, keeping only admin accounts
     * @returns A Promise resolving to true if all users have been eliminated, false otherwise
     */
    deleteAll(): Promise<Boolean>{
        return new Promise<Boolean>((resolve, reject) => {
            try {
                const sql = "DELETE FROM users WHERE username != 'Admin'"
                db.run(sql, (err: Error | null) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(true)
                })
            } catch (error) {
                reject(error)
            }

        })
    }

}
export default UserDAO