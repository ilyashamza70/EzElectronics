
/*
    Trying to run a simple SQL Queery to retrieve the user info
    And organaizing it by the role.
    Currently we have 3 USers with thre different roles:
    1. Admin:       Ilyashamza70
    2. Customer:    mery
    3. Manager:     Maria

    Something is wrong with SQL Connection to file. Can't retireve info or 
    see the users table??? Whyy troubleshoot

*/
BEGIN TRANSACTION;
SELECT 
    role, 
    COUNT(*) AS num_users, 
    GROUP_CONCAT(username) AS usernames
FROM 
    users
GROUP BY 
    role
ORDER BY 
    num_users DESC;
COMMIT;