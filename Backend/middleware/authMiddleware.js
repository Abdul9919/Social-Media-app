const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
     const authHeader = req.headers['authorization'];
     if(!authHeader){
        return res.status(401).json({ message: 'No token provided' });
     }
     const token = authHeader.split(' ')[1];
     if(!token){
        return res.status(404).json({message : 'token is missing in header'})
     }
     try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next()
     } catch (error) {
        res.status(500).json({message : error.message})
     }
}

module.exports = protect