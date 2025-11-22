const mongoose = require('mongoose');

const uri = "mongodb+srv://admin:LetsShop2025Strong@cluster0.un2w1ez.mongodb.net/?appName=Cluster0";

async function testConnection() {
    try {
        console.log("Attempting to connect...");
        await mongoose.connect(uri);
        console.log("Connection SUCCESSFUL!");
        await mongoose.connection.close();
    } catch (error) {
        console.error("Connection FAILED:", error.message);
    }
}

testConnection();
