import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Pusher from "pusher";
import dbModel from "./dbModel.js";

// app config
const app = express();
const port = process.env.PORT || 8080;

// the pusher config
const pusher = new Pusher({
    appId: "1242630",
    key: "011d4d0ea33517b9ab06",
    secret: "abe1a885e4370a581078",
    cluster: "eu",
    usetls: true,
});

//middleware config
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));

// Db config/ connection
const connection_Url =
    "mongodb+srv://Aaron:password123_4@cluster0.2feop.mongodb.net/instaDB?retryWrites=true&w=majority";
mongoose.connect(connection_Url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// mongoose connection/ pusher connection
mongoose.connection.once("open", () => {
    console.log("DB connected ---123466");

    const changeStream = mongoose.connection.collection("posts").watch();

    changeStream.on("change", (change) => {
        console.log("Change Triggered on pusher");
        console.log(change);
        console.log("End of Change");

        if (change.operationType === "insert") {
            console.log("Trigerring pusher ***IMG upload***");

            const postDetails = change.fullDocument;
            pusher.trigger("posts", "inserted", {
                user: postDetails.user,
                caption: postDetails.caption,
                image: postDetails.image,
            });
        }else {
            console.log('Unknown triger from pusher')
        }
    });
});

// api routes
app.get("/", (req, res) => res.status(200).send("hello world 1234"));

app.post("/upload", (req, res) => {
    const body = req.body;
    //  console.log(body);

    // const dbModelData = new dbmodel(body)
    
    // try {
        
    //     dbModelData.create();
    //     res.status(201).send(data)
    // } catch (error) {
    //     res.status(500).send(err.message)
    // }   
    // from line 67 to 76 could also be used and it will bring out same output


    dbModel.create(body, (err, data) => {
        // in the create method the body is what we want to create the callback function (err,data)is to help check if there is any error, the data in call back function does nothing much but must be included to pass in something
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).send(data);
        }
    });
});

app.get("/sync", (req, res) => {
    // as its above is also here
    dbModel.find((err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }
    });
});

//liseten
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
