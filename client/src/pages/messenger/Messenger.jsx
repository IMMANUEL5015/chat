import {useState, useEffect, useContext, useRef} from 'react';
import axios from 'axios';
import Conversation from '../../components/conversation/Conversation';
import Topbar from '../../components/topbar/Topbar';
import Message from '../../components/message/Message';
import './messenger.css';
import ChatOnline from '../../components/chatOnline/ChatOnline';
import { AuthContext } from '../../context/AuthContext';
import {io} from 'socket.io-client';

export default function Messenger(){
    const {user} = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const socket = useRef()
    const scrollRef = useRef();

    useEffect(() => {
        socket.current = io(`ws://localhost:8900`);
        socket.current.on('getMessage', (data) => {
            setArrivalMessage({
                sender: data.senderId,
                text: data.text,
                createdAt: Date.now()
            });
        });
    }, [])

    useEffect(() => {
        arrivalMessage && currentChat?.members.includes(arrivalMessage.sender) &&
        setMessages(prev => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        socket.current.emit('addUser', user._id);
        socket.current.on("getUsers", users => {
            setOnlineUsers(user.followings.filter(f => users.some(u => u.userId === f)));
        })
    }, [user]);

    useEffect(() => {
        const getConversations = async () => {
            try{
                const res = await axios.get('/conversations/'+user._id);
                setConversations(res.data);
            }catch(error){
                console.error(error);
            }
        }

        getConversations();
    }, [user]);

    useEffect(() => {
        const getMessages = async () => {
            if(currentChat){
                try{
                    const res = await axios.get('/messages/'+currentChat._id);
                    setMessages(res.data);
                }catch(error){
                    console.error(error);
                }
            }
        }

        getMessages();
    }, [currentChat]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const message = {
            sender: user._id,
            conversationId: currentChat._id,
            text: newMessage
        }

        const receiverId = currentChat.members.find(member => member !== user._id);

        socket.current.emit('sendMessage', {
            senderId: user._id,
            text: newMessage,
            receiverId
        });

        try{
            const res = await axios.post("/messages", message);
            setMessages([...messages, res.data]);
            setNewMessage("");
        }catch(error){
            console.log(error);
        }
    }

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    return (
        <>
            <Topbar/>
            <div className="messenger">
                <div className="chatMenu">
                    <div className="chatMenuWrapper">
                        <input
                            placeholder="Search for friends"
                            className="chatMenuInput"/>
                        {
                            conversations.map(c => {
                                return (
                                <div onClick={() => setCurrentChat(c)} key={c._id}>
                                    <Conversation 
                                        conversation={c}
                                        currentUser={user}
                                    />
                                </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="chatBox">
                {
                    currentChat ?
                    <div className="chatBoxWrapper">
                        <div className="chatBoxTop">
                            {
                                messages.map(m => {
                                    return (
                                        <div key={m._id} ref={scrollRef}>
                                           <Message 
                                                own={m.sender === user._id} 
                                                message={m} 
                                            /> 
                                        </div>
                                        
                                    )
                                })
                            }
                        </div>
                        <div className="chatBoxBottom">
                            <textarea
                                className="chatMessageInput" 
                                placeholder="Write Something..."
                                onChange={(e) => setNewMessage(e.target.value)}
                                value={newMessage}
                            >

                            </textarea>
                            <button
                                onClick={handleSubmit} 
                                className="chatSubmitButton"
                            >
                                    Send
                            </button>
                        </div>
                    </div> : <span className="noConversationText">
                            Open a conversation to start a chat
                        </span>
                }
                </div>
                <div className="chatOnline">
                    <div className="chatOnlineWrapper">
                        <ChatOnline 
                            onlineUsers={onlineUsers} 
                            currentId={user._id}
                            setCurrentChat={setCurrentChat}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}