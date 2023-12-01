import React, { useState } from "react";
import Add from "../images/addAvatar.png";
import {auth, storage, db} from "../firebase";
import {createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore"; 
import { Link, useNavigate } from "react-router-dom";

function Register() {

const [err, setErr] = useState(false);
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    console.log(displayName);
    console.log(email);
    console.log(password);
    console.log(file);

    if (!displayName) {
        alert("Name is required!");
        return;
    } else if (!email) {
        alert("email is required!");
        return;
    } else if (!password) {
        alert("password is required!");
        return;
    } else if (password.length <= 6) {
        alert("password too short!");
        return;
    } else if (!file) {
        alert("Profile Image is required!");
        return;
    }

    try {
        const createUserResponse = await createUserWithEmailAndPassword(auth, email, password);
      
        const storageRef = ref(storage, displayName);
        const snapshot = await uploadBytesResumable(storageRef, file);
      
        const downloadURL = await getDownloadURL(snapshot.ref);
      
        await updateProfile(createUserResponse.user, {
          displayName,
          photoURL: downloadURL,
        });
      
        await setDoc(doc(db, "users", createUserResponse.user.uid), {
          uid: createUserResponse.user.uid,
          displayName,
          email,
          photoURL: downloadURL,
        });
      
        await setDoc(doc(db, "userChats", createUserResponse.user.uid), {});
      
        navigate("/");
      } catch (error) {
        console.error(error);
        setErr(true);
      }
}

return (
<div className="formContainer">
    <div className="formWrapper">
        <span className="logo">Fire Chat</span>
            <span className="title">Register</span>
            
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="display name"/>
            <input type="email" placeholder="email"/>
            <input type="password" placeholder="password"/>
            <input type="file" id="file" style={{ display: 'none' }} />
            <label htmlFor="file">
                <img src={Add} />
                <span>Add an Image</span>
            </label>
            <button>Sign up</button>
            {err && <span>Something went wrong!</span>}
        </form>
        <p>have an account ? <Link to="/login">Login</Link></p>
    </div>
</div> 
)
}

export default Register;