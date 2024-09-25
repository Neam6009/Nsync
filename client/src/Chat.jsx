import React, { useEffect, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';

const Chat = () => {
    const [ws,setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);

    const showOnlinePeople = (peopleArray)=>{
       const people = {};
       peopleArray.forEach(({UserId,username}) => {
            people[UserId] = username;
       } )
       setOnlinePeople(people);
       console.log(people)
    }

    const handleMessage = (e)=>{
        const msgData = JSON.parse(e.data)
        if('online' in msgData){
            showOnlinePeople(msgData.online);

        }
    }

    useEffect(()=>{
        const wss =  new WebSocket('ws://localhost:4000');
        setWs(wss);

        wss.addEventListener('message',handleMessage );
    },[]);
    
    return (
        <div className='flex h-screen p-10 shadow-2xl'>
            <div className='bg-customGray w-1/3 text-white rounded-l-lg pl-4 pt-4 mb-4'>
                <Logo/>
                {Object.keys(onlinePeople).map(uid => (
                <div className= {(uid === selectedUser)? "bg-gray-50 bg-opacity-20 rounded-lg mr-4": "mr-4 "}>
                <div key={uid} onClick={()=> setSelectedUser(uid)} className='border-gray-50 py-2 bg-gray-50 bg-opacity-5 cursor-pointer
                 flex gap-2 items-center hover:bg-gray-50 hover:bg-opacity-20  rounded-lg  transition duration-300 pl-2 mb-2'>
                    <Avatar username={onlinePeople[uid]} UserId={uid}/>
                    <span className='text-gray-50'>
                        {onlinePeople[uid]}
                    </span>
                </div>  
                </div>
            ))}
            </div>
            <div className='bg-gray-200 w-2/3 text-black rounded-r-lg p-2 flex flex-col mb-4'>
                <div className='flex-grow'>
                    messages from a selected person
                </div>
                <div className='flex gap-2 p-2'>
                    <input type='text' className='bg-white border-black p-2 rounded-xl flex grow' placeholder='text here....' />
                    <button className='bg-black text-white p-2 rounded-3xl '>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>

                    </button>
                </div>
            </div>

        </div>
    )
}

export default Chat