import axios from "axios";
import {useState, useEffect} from "react";
import "./chatOnline.css";

export default function ChatOnline({onlineUsers, currentId, setCurrentChat}){
    const [friends, setFriends] = useState([]);
    const [onlineFriends, setOnlineFriends] = useState([]);
    const pf = process.env.REACT_APP_PUBLIC_FOLDER;

    useEffect(() => {
        const getUsers = async () => {
            try{
                const res = await axios.get("/users/friends/"+currentId);
                setFriends(res.data);
            }catch(error){
                console.error(error);
            }
        }

        getUsers();
    }, [currentId]);

    useEffect(() => {
        setOnlineFriends(friends.filter(f => onlineUsers.includes(f._id)));
    }, [friends, onlineUsers]);

    const handleClick = async (user) => {

        try{
            const res = await axios.get(`/conversations/find/${currentId}/${user._id}`);
            setCurrentChat(res.data);
        }catch(error){
            console.log(error);
        }
    }

    return (
        <div className="chatOnline">
            {
                onlineFriends.map(o => {
                    return (
                       <div className="chatOnlineFriend" key={o._id} onClick={() => handleClick(o)}>
                         <div className="chatOnlineImgContainer">
                            <img className="chatOnlineImage" src={pf+'/person/noAvatar.png'} alt="" />
                            <div className="chatOnlineBadge"></div>
                         </div>
                         <span className="chatOnlineName">{o.username}</span>
                       </div> 
                    )
                })
            }
        </div>
    )
}