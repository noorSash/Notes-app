const jwt = require('jsonwebtoken');
const invalidTokens = new Set(); 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; // Access the authorization header
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from header
 


    if (!token) return res.sendStatus(401); // If no token is found, return 401 Unauthorized

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(401); // If token is invalid or expired, return 403 Forbidden

        req.user = user; // Attach the user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = {
    authenticateToken, invalidTokens
};


