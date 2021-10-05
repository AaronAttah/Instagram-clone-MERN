import React, { useState, useEffect } from "react";
import "./App.css";
import Post from "./Post";
import { db, auth } from "./firebase";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Button, Input } from "@material-ui/core";
import ImageUpload from "./ImageUpload";
import InstagramEmbed from 'react-instagram-embed';
import axios from "./axios";
import Pusher from 'pusher-js' //front end its installed as npm installed pusher-js but backend needs no -js

// modal part
function getModalStyle() {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}

const useStyles = makeStyles((theme) => ({
    paper: {
        position: "absolute",
        width: 400,
        backgroundColor: theme.palette.background.paper,
        border: "2px solid #000",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
})); //here

function App() {
    //maodal part2
    const classes = useStyles();
    const [modalStyle] = useState(getModalStyle);
    //here

    const [posts, setPosts] = useState([]);
    const [open, setOpen] = useState(false);
    const [openSignIn, setOpenSignIn] = useState(false);
    const [email, setEmail] = useState();
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [user, setUser] = useState(null);

    //.................. the function below is called in the second useEffect below...
    // const getPosts = () => {
    //     db.collection("posts")
    //         .orderBy("timestamp", "desc")
    //         .onSnapshot((snapshot) => {
    //             setPosts(
    //                 snapshot.docs.map((doc) => {
    //                     return { id: doc.id, post: doc.data() };
    //                 })
    //             );
    //         });
    // };
    // useEffect(() => {
    //     getposts()
       
    // }, [])

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((authUser) => {
            if (authUser) {
                //user has logged in ....
                // console.log(authUser);
                setUser(authUser);

                if (authUser.displayName) {
                    //dont update username
                } else {
                    return authUser.updateProfile({
                        displayName: username,
                    });
                }
            } else {
                // user has logged out.....
                setUser(null);
            }
        });
        return () => {
            //performs some cleaner up actions
            unsubscribe();
        };
    }, [user, username]);


    // geting datas from our mongodb 
    const fetchPosts = async () =>
    await axios.get("http://localhost:8080/sync").then((response) => {
          console.log(response);
          setPosts(response.data);
      });
    useEffect(() => {
        fetchPosts();
    }, []);

//pusher for the frontEnd
    useEffect(() =>{
        const pusher = new Pusher('011d4d0ea33517b9ab06', {
            cluster: 'eu'
          });
      
          const channel = pusher.subscribe('posts');
          channel.bind('inserted', (data) => {
            console.log("data recieved", data);
            fetchPosts()
        }) 
    }, [])

    console.log("posts are >>>", posts);
    posts.forEach(post => {
        console.log('post >>>>>>>', post)
    })


    const signUp = (event) => {
        event.preventDefault();

        auth.createUserWithEmailAndPassword(email, password)
            .then((authUser) => {
                return authUser.user.updateProfile({
                    displayName: username,
                });
            })
            .catch((error) => alert(error.message));

        setOpen(false);

        // console.log(password);
    };

    const signIn = (event) => {
        event.preventDefault();
        auth.signInWithEmailAndPassword(email, password).catch((error) =>
            alert(error.message)
        );
        setOpenSignIn(false);
    };

    return (
        <div className="app">
            <Modal //modal part3 signUp
                open={open}
                onClose={(e) => setOpen(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <center>
                        <img
                            className="app_headerImage"
                            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                            alt=""
                        />
                    </center>

                    <form className="app_signup">
                        <Input
                            placeholder="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            placeholder="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            placeholder="password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" onClick={signUp}>
                            Sign Up
                        </Button>
                    </form>
                </div>
            </Modal>

            <Modal //modal part4 signIN
                open={openSignIn}
                onClose={() => setOpenSignIn(false)}
            >
                <div style={modalStyle} className={classes.paper}>
                    <center>
                        <img
                            className="app_headerImage"
                            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                            alt=""
                        />
                    </center>

                    <form className="app_signup">
                        <Input
                            placeholder="email"
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            placeholder="password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Button type="submit" onClick={signIn}>
                            Sign In
                        </Button>
                    </form>
                </div>
            </Modal>

            {/* Header */}

            <div className="app_header">
                <img
                    className="app_headerImage"
                    src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
                    alt=""
                />

                {/* signup & loginout */}
                {user ? (
                    <Button onClick={() => auth.signOut()}>Logout</Button>
                ) : (
                    <div className="app_loginContainer">
                        <Button onClick={() => setOpenSignIn(true)}>
                            Sign In
                        </Button>
                        <Button onClick={() => setOpen(true)}>Sign Up</Button>
                    </div>
                )}
            </div>

            {/* posts comoponent here 👇👇👇 */}
            <div className="app_posts">
                <div className="app_postsLeft">
                    {posts.map((post) => (
                        <Post
                            user={user}
                            key={post._id}
                            postId={post._id}
                            username={post.user}
                            caption={post.caption}
                            imageUrl={post.image}
                        />
                    ))}
                </div>

                <div className="app_postsRight">
                <InstagramEmbed
                    url='https://instagr.am/p/Zw9o4/'
                    clientAccessToken='123|456'
                    maxWidth={320}
                    hideCaption={false}
                    containerTagName='div'
                    protocol=''
                    injectScript
                    onLoading={() => {}}
                    onSuccess={() => {}}
                    onAfterRender={() => {}}
                    onFailure={() => {}}
                />  
                </div>
            </div>
                        {/* image upload components below */}

            {user?.displayName ? (
                <ImageUpload username={user.displayName} />
            ) : (
                <h3
                    style={{
                        backgroundColor: "lightblue",
                        padding: "10px 10px 10px 30px",
                        fontFamily: "monospace",
                    }}
                >
                    Sorry! you need to login to upload
                </h3>
            )}
        </div>
    );
}

export default App;
