import React, { useContext, useState } from "react";
import Img from "../images/img.png";
import Attach from "../images/attach.png";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/Context";
import { Timestamp, arrayUnion, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import {v4 as uuid} from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { db, storage } from "../firebase";


function Input() {
  const {data} = useContext(ChatContext);
  const {currentUser} = useContext(AuthContext);

  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImg(file)
  }

  const handleSend = async () => {
    if (img) {
      try {
        const storageRef = ref(storage, uuid());
        const snapshot = await uploadBytesResumable(storageRef, img);
  
        // Get the download URL directly from the snapshot
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Update Firestore with the download URL
        await updateDoc(doc(db, "chats", data.chatId), {
          messages: arrayUnion({
            id: uuid(),
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            img: downloadURL,
          }),
        });
  
        console.log("chat image", downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle the error accordingly
      }
    } else {
      const updateGroupChatsResponse = await updateDoc(doc(db, "chats", data.chatId),{
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          date: Timestamp.now(),
        }),
      });

      console.log("updateGroupChatsResponse", updateGroupChatsResponse);
    }

    const updateSenderChatResponse = await updateDoc(doc(db, "userChats", currentUser.uid), {
      [data.chatId + ".lastMessage"] : {
        text,
      },
      [data.chatId + ".date"] : serverTimestamp(),
    });

    console.log("updateSenderChatResponse", updateSenderChatResponse);

    const updateReceiverChatResponse = await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"] : {
        text,
      },
      [data.chatId + ".date"] : serverTimestamp(),
    });

    console.log("updateReceiverChatResponse", updateReceiverChatResponse);

    setText("");
    setImg(null);
  };


    return (
        <div className="input">
          <input type="text" value={text} placeholder="Type Something..." onChange={e => setText(e.target.value)} />
          <div className="send">
            <img src={Attach} alt=""/>
            <input type="file" id="file" style={{display:"none"}} onChange={handleImageUpload} />
            <label htmlFor="file">
                <img src={Img} alt=""/>
            </label>
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
    )
}

export default Input
































// function Input() {
//   const {data} = useContext(ChatContext);
//   const {currentUser} = useContext(AuthContext);

//   const [text, setText] = useState("");
//   const [img, setImg] = useState(null);

//   const handleImageUpload = (e) => {
//     const file = e.target.files[0];
//     setImg(file)
//   }

//   const handleSend = async () => {
//     if (img) {
//       const storageRef = ref(storage, uuid());
//       const uploadTask = uploadBytesResumable(storageRef, img);
//         console.log("entering if with img", img)
//         uploadTask.on(
//         (error) => {
//             console.log("error in photo upload ??" +error)
//             // setErr(true);
//         }, 
//         async () => {

//             await getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
//               console.log("entering getDownloadURL", img)
//               await updateDoc(doc(db, "chats", data.chatId),{
//                 messages: arrayUnion({
//                   id: uuid(),
//                   text,
//                   senderId: currentUser.uid,
//                   date: Timestamp.now(),
//                   img: downloadURL,
//                 }),
//               });
//               console.log("chat image", downloadURL)
//             });
//         }
//         );
//     } else {
//       const updateGroupChatsResponse = await updateDoc(doc(db, "chats", data.chatId),{
//         messages: arrayUnion({
//           id: uuid(),
//           text,
//           senderId: currentUser.uid,
//           date: Timestamp.now(),
//         }),
//       });

//       console.log("updateGroupChatsResponse", updateGroupChatsResponse);
//     }

//     const updateSenderChatResponse = await updateDoc(doc(db, "userChats", currentUser.uid), {
//       [data.chatId + ".lastMessage"] : {
//         text,
//       },
//       [data.chatId + ".date"] : serverTimestamp(),
//     });

//     console.log("updateSenderChatResponse", updateSenderChatResponse);

//     const updateReceiverChatResponse = await updateDoc(doc(db, "userChats", data.user.uid), {
//       [data.chatId + ".lastMessage"] : {
//         text,
//       },
//       [data.chatId + ".date"] : serverTimestamp(),
//     });

//     console.log("updateReceiverChatResponse", updateReceiverChatResponse);

//     setText("");
//     setImg(null);
//   };


//     return (
//         <div className="input">
//           <input type="text" value={text} placeholder="Type Something..." onChange={e => setText(e.target.value)} />
//           <div className="send">
//             <img src={Attach} alt=""/>
//             <input type="file" id="file" style={{display:"none"}} onChange={handleImageUpload} />
//             <label htmlFor="file">
//                 <img src={Img} alt=""/>
//             </label>
//             <button onClick={handleSend}>Send</button>
//           </div>
//         </div>
//     )
// }

// export default Input