require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./config/db');
const passportConfig = require('./config/passport');
const flash = require('connect-flash');
const multer = require('multer');
const cloudinary = require('./config/cloudinary'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const axios = require('axios');
const socketIo = require("socket.io");
const http = require("http");
const path = require('path');
const RestrictedWord = require("./models/RestrictedWord");

// Import Chat model
const Chat = require('./models/Chat');

// Helper function to create a unique room name from two user IDs
const getRoomName = (id1, id2) => {
  return [id1, id2].sort().join("-");
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB and configure passport
connectDB();
passportConfig(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
        }),
        cookie: { secure: false, httpOnly: true },
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

/* Socket.io Integration */


io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // When a client joins a chat room
    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // When a client sends a message
    socket.on("sendMessage", async (data) => {
        try {
            // Fetch all restricted words from the database
            const restrictedWords = await RestrictedWord.find().select("word");
            const restrictedList = restrictedWords.map(w => w.word.toLowerCase());

            // Replace restricted words with "X"
            let sanitizedMessage = data.message.split(" ").map(word => 
                restrictedList.includes(word.toLowerCase()) ? "X" : word
            ).join(" ");

            // Save the sanitized message to the database
            const newChat = await Chat.create({
                senderId: data.senderId,
                receiverId: data.receiverId,
                message: sanitizedMessage,
            });

            // Create a room name
            const room = getRoomName(data.senderId, data.receiverId);

            // Emit the sanitized chat message
            io.to(room).emit("message", newChat);
        } catch (error) {
            console.error("Error processing chat message:", error);
        }
    });
});


app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.currUser = req.user;
    next();
});

// Routes from external router file
app.use('/', require('./routes/route'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
