const jwt = require('jsonwebtoken');
const User = require('../models/Users')
const authHandler = async (req, res, next) =>{
    try {
        const token = req.header("Authorization").replace("Bearer ", "");4
        const decodedToken = jwt.verify(token, "fghjklopyuimjkl8896dddddryhpp");
        const user = await User.findOne({_id: decodedToken._id, "tokens.token": token});
        if(!user){
            throw new Error()
        };
        req.token= token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({error: "please login"})
    }
};

module.exports = authHandler;