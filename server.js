const express = require("express");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const app = express();
const port = 5000;
const Contact = require("./contactModel");
const Redis = require("redis");

mongoose.connect(
    "mongodb://127.0.0.1/resthub",
    { useNewUrlParser: true }
).then(
    () => {
        console.log("MongoDB Successfully Connected");
    },
    (err) => {
        console.log("MongoDB Error:", err);
        console.log("MongoDB connection error. Please make sure MongoDB is running.");
    },
);

const client = Redis.createClient();
client.connect()
    .then(
        () => {
            console.log("Redis Successfully Connected Redis");
        },
        (err) => {
            console.log("Redis Error:", err);
            console.log("Redis connection error. Please make sure Redis is running.");
        },
    );



const db = mongoose.connection;
app.use(express.json());
app.use(cors());
app.options("*", cors());

app.get("/contacts", async (req, res) => {
    try {
        const cache = await client.get("contacts");
        if (cache) {
            console.log("Cache hit")
            const allUsers = JSON.parse(cache);
            res.status(200).json(allUsers);
        } else {
            console.log("Cache miss")
            const users = await Contact.find();
            client.setEx("contacts", 3600, JSON.stringify(users));
            res.status(200).json(users);
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(process.env.PORT || port, () => console.log(`Server Started on port :${port}`));

module.exports = app;