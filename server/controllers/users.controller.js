const userModel = require("../models/users.model");

exports.getUsers = async (req,res) => {
    const user = await userModel.find({});
    try {
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
}