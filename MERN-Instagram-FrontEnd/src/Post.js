import React, { useState, useEffect } from "react";
import "./Post.css";
import Avatar from "@material-ui/core/Avatar";
import { db } from "./firebase";
import { Button, Input } from "@material-ui/core";
import firebase from "firebase"

function Post({ postId, user, username, caption, imageUrl }) {
    const [comments, setComments] = useState([]); // that which was set from the firebase
    const [comment, setComment] = useState([]);// from clientpost

    useEffect(() => {
        let unsubscribe;
        if (postId) {
            unsubscribe = db
                .collection("posts")
                .doc(postId)
                .collection("comments")
                .orderBy('timestamp', "desc")
                .onSnapshot((snapshot) => {
                    setComments(snapshot.docs.map((doc) => doc.data()));
                });
        }

        return () => {
            unsubscribe();
        };
    }, [postId]);


    const postComment = (e) => {
        e.preventDefault()

        db.collection("posts").doc(postId).collection("comments").add({
            text: comment,
            username: user.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()

        })
       
           setComment("")   
       

    }

    return (
        <div className="post">
            <div className="post_header">
                <Avatar
                    className="post_avatar"
                    alt="Baron"
                    src="/static/images/avatar/1.jpg"
                />
                <h3>{username}</h3>
            </div>
            {/* header -> avater -> username */}

            <img
                className="post_image"
                alt="users post "
                src={imageUrl}
                //    src="https://images.pexels.com/photos/241316/pexels-photo-241316.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"
            />
            {/* image */}

            {/* username + caption */}
            <h4 className="post_text" style={{paddingLeft:"5px"}}>
                
                <strong> {username} </strong> {caption}
            </h4>

            <div className="post_comments">
               { comments.map((comment) => (
                   <p>
                       <strong>{comment.username}</strong> {comment.text}
                   </p>
               ))}
            </div>

            {user && (
                <form className="post_commentBox">
                    <Input
                        className="post_input"
                        placeholder="Add a comment...."
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Button style={{border:"none", color:"#6082a3"}} className="post_button"  type="submit" onClick={postComment}>
                        POst
                    </Button>
                </form>
            )}

          
        </div>
    );
}

export default Post;
