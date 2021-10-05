import React, { useState } from "react";
import { Button, Input } from "@material-ui/core";
import { storage, db } from "./firebase";
import firebase from "firebase";
import "./ImageUpload.css";
import axios from "./axios";

function ImageUpload({ username }) {
    const [image, setImage] = useState("");
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");
    const [url, setUrl] = useState("");

    console.log(url)

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        const uploadTask = storage.ref(`images/${image.name}`).put(image);

        // progres bar in action
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                // progress bar function...
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setProgress(progress);
            },
            (error) => {
                //error function...
                console.error(error);
                alert(error.message);
            },
            () => {
                // complete function... were the url is gotten
                storage
                    .ref("images")
                    .child(image.name)
                    .getDownloadURL()
                    .then((url) => {
                        setUrl(url);

                        const usernowpost ={
                            caption: caption,
                            user: username,
                            image: url,

                        }

                        axios.post('http://localhost:8080/upload', usernowpost)
                        .then((response) => {
                            console.log(response);
                          }, (error) => {
                            console.log(error);
                          });

                        //post image inside db
                        db.collection("posts").add({
                            timestamp:
                                firebase.firestore.FieldValue.serverTimestamp(),
                            caption: caption,
                            imageUrl: url,
                            username: username,
                        });

                        setProgress(0);
                        setCaption("");
                        setImage(null);
                    });
            }
        );
    };

    return (
        <div className="ImageUpload">
            <progress
                className="imageupload_progress"
                value={progress}
                max="100"
            ></progress>
            <Input
                type="text"
                placeholder="Enter a caption..."
                onChange={(e) => setCaption(e.target.value)}
                value={caption}
            />
            <Input type="file" onChange={handleChange} />
            <Button onClick={handleUpload}>Upload</Button>
        </div>
    );
}

export default ImageUpload;
