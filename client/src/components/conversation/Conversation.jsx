import axios from 'axios';
import { useEffect } from 'react';
import {useState} from 'react';
import './conversation.css';

export default function Conversation({conversation, currentUser}){
    const [user, setUser] = useState(null);
    const pf = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        const friendId = conversation.members.find(m => m !== currentUser._id);

        const getUser = async () => {
            try{
                const res = await axios.get(`http://localhost:8800/api/users?userId=${friendId}`);
                setUser(res.data);
            }catch(error){
                console.log(error);
            }
        }

        getUser();
    }, [currentUser, conversation]);

    return (
        <div className="conversation">
            <img src={user && user.profilePicture ? user.profilePicture : pf+'person/noAvatar.png'} 
                alt="" 
                className="conversationImage" 
            />
            <span className="conversationName">{user && user.username}</span>
        </div>
    )
}