import React, { useContext, useEffect, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext, UserContextProvider } from './UserContext.jsx';


const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMsgText, setNewMsgText ] = useState('');
    const [messages, setMessages] = useState([]);
    const data = useContext(UserContext);
    const UserId = data.id;

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ UserId, username }) => {
            people[UserId] = username;
        })
        setOnlinePeople(people);
        //    console.log(people)
    }

    const handleMessage = (e) => {
        const msgData = JSON.parse(e.data)
        console.log(e,msgData);
        if ('online' in msgData) {
            showOnlinePeople(msgData.online);
        }else if('text' in msgData){
            
           setMessages(prev => ([...prev,{isOur:false,text:msgData.text}]))
        }
    }

    const sendMessage = (event)=>{
        event.preventDefault();
        ws.send(JSON.stringify({
                recipient : selectedUser,
                text: newMsgText,
            
        }))

        setNewMsgText('');
        setMessages(prev => ([...prev,{text: newMsgText,isOur:true}]));
    }

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);

        ws.addEventListener('message', handleMessage);
    }, []);

    const onlinePeopleExcludingUser = { ...onlinePeople };
    delete onlinePeopleExcludingUser[UserId];


    return (
        <div className='flex h-screen p-10 shadow-2xl'>
            <div className='bg-customGray w-1/3 text-white rounded-l-lg pl-4 pt-4 mb-4'>
                <Logo />
                {Object.keys(onlinePeopleExcludingUser).map(uid => (


                    <div key={uid} className={(uid === selectedUser) ? "bg-gray-50 bg-opacity-20 rounded-lg mr-4 flex-grow" : "mr-4 flex-grow "}>
                        <div key={uid} onClick={() => setSelectedUser(uid)} className='border-gray-50 py-2 bg-gray-50 bg-opacity-5 cursor-pointer
                    flex gap-2 items-center hover:bg-gray-50 hover:bg-opacity-20  rounded-lg  transition duration-300 pl-2 mb-2'>
                            <Avatar username={onlinePeople[uid]} UserId={uid} />
                            <span className='text-gray-50'>
                                {onlinePeople[uid]}
                            </span>
                        </div>
                    </div>

                ))}
            </div>
            <div className='bg-gray-200 w-2/3 text-black rounded-r-lg p-2 flex flex-col mb-4'>
                <div className='flex-grow'>
                    {!selectedUser && (
                        <div className='flex h-full items-center justify-center text-black font-semibold'>
                            <div>
                                &larr; Select a user 
                            </div>
                        </div>
                    )}
                    {!!selectedUser &&(
                        <div>
                            {messages.map(msg=> (
                                <div key={msg.text}>
                                    {msg.text}
                                </div>
                            ))}
                        </div>
                    )

                    }

                </div>
                {!!selectedUser  && (
                    <form className='flex gap-2 p-2' onSubmit={sendMessage}>
                    <input type='text' 
                    value={newMsgText}
                    onChange={e => setNewMsgText(e.target.value)}
                    className='bg-white outline-none p-2 rounded-xl flex grow ' placeholder='text here....' />
                    <button className='bg-black text-white p-2 rounded-3xl ' type='submit'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                    </button>
                </form>

                )}
                
            </div>

        </div>
    )
}

export default Chat