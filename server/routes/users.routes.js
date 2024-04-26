const express = require("express");
const app = express();
const userController = require('../controllers/users.controller');

// app.post('/API/users', userController.chargeServer); // Charge Server
// app.put('/API/users', userController.addUser); // Register User
// app.patch('/API/file', userController.shareFile); // Share File
// app.delete('/API/folder', userController.deleteFolder); // Delete Folder

app.get('/v1/users', userController.getUsers);

module.exports = app;