import React, { useContext, useEffect, useRef, useState } from 'react'
import Avatar from './Avatar';
import Logo from './Logo';
import { UserContext, UserContextProvider } from './UserContext.jsx';
import _ from 'lodash';
import axios from 'axios';
import Contact from './Contact.jsx';

const Chat = () => {
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [newMsgText, setNewMsgText] = useState('');
    const [messages, setMessages] = useState([]);
    const [offline, setOfflinePeople] = useState({});
    const { username, id, setId, setUsername } = useContext(UserContext);
    const divUnderMsgBox = useRef();
    const UserId = id;

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ UserId, username }) => {
            people[UserId] = username;
        })
        setOnlinePeople(people);
        //    console.log(people)
    }

    const logout = () => {
        axios.post('/logout').then(() => {
            setWs(null);
            setId(null);
            setUsername(null);
        })
    }

    const handleMessage = (e) => {
        const msgData = JSON.parse(e.data)
        // console.log(e, msgData);
        if ('online' in msgData) {
            showOnlinePeople(msgData.online);
        } else if ('text' in msgData) {

            setMessages(prev => ([...prev, { ...msgData }]))
        }
    }

    const sendMessage = (event, file = null) => {
        if (event) {
            event.preventDefault();
        }
        if (newMsgText != '' || file != null) {
            ws.send(JSON.stringify({
                recipient: selectedUser,
                text: newMsgText,
                file,
            }))



            if (file) {
                axios.get('/messages/' + selectedUser).then(res => {
                    const { data } = res;
                    setMessages(data);

                });
                setNewMsgText('');
                setMessages(prev => ([...prev, {
                    text: newMsgText,
                    sender: UserId,
                    recipient: selectedUser,
                    _id: Date.now()
                }]));
            } else {
                setNewMsgText('');
                setMessages(prev => ([...prev, {
                    text: newMsgText,
                    sender: UserId,
                    recipient: selectedUser,
                    _id: Date.now()
                }]));
            }
        }
    }

    const sendFile = async (e) => {
        const reader = new FileReader();
        const fileType = e.target.files[0].type;
        if (fileType === 'application/pdf') {
            reader.readAsArrayBuffer(e.target.files[0]);
        } else {
            reader.readAsDataURL(e.target.files[0]);
        }
        reader.onload = () => {
            let base64Data;
            if (fileType === 'application/pdf') {
                const fileData = reader.result;
                base64Data = btoa(String.fromCharCode(...new Uint8Array(fileData)));
            } else {
                base64Data = reader.result.split(',')[1];
            }

            sendMessage(null, {
                info: e.target.files[0].name,
                data: base64Data
            });
        };

    }

    const connectToWs = () => {
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);

        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log("disconnected tyring to reconnect!");
                connectToWs();
            }, 1000);
        });
    }

    useEffect(() => {
        connectToWs();
    }, []);

    useEffect(() => {
        const div = divUnderMsgBox.current;
        if (div) {
            div.scrollIntoView({ behaviour: 'smooth', block: 'end' });
        }
    }, [messages])

    useEffect(() => {
        axios.get('/people').then(res => {
            const offlinePeopleArray = res.data;
            const offlinePeople = {};
            const offlinePeopleArrayFiltered = offlinePeopleArray.filter(p => p._id != UserId)
                .filter(p => !Object.keys(onlinePeople).includes(p._id));

            offlinePeopleArrayFiltered.forEach(p => {
                offlinePeople[p._id] = p.username;
            })
            // console.log(offlinePeople);


            setOfflinePeople(offlinePeople)
        })
    }, [onlinePeople])

    useEffect(() => {
        if (selectedUser) {
            axios.get('/messages/' + selectedUser).then(res => {
                const { data } = res;
                // console.log(data)
                setMessages(data);

            });
        }
    }, [selectedUser])

    const onlinePeopleExcludingUser = { ...onlinePeople };
    delete onlinePeopleExcludingUser[UserId];

    const uniqueMessages = _.uniqBy(messages, '_id');


    return (
        <div className='flex h-screen p-10 shadow-2xl'>
            <div className='bg-customGray w-1/3 text-white rounded-l-lg pl-4 pt-4 mb-4 pb-2 flex flex-col'>
                <div className='flex-grow'>
                    <Logo />
                    {Object.keys(onlinePeopleExcludingUser).map(uid => (

                        <Contact
                            key={uid}
                            uid={uid}
                            username={onlinePeopleExcludingUser[uid]}
                            onClick={() => setSelectedUser(uid)}
                            selected={uid === selectedUser}
                            onlineStatus={true}
                        />
                    ))
                    }
                    {Object.keys(offline).map(uid => (

                        <Contact
                            key={uid}
                            uid={uid}
                            username={offline[uid]}
                            onClick={() => setSelectedUser(uid)}
                            selected={uid === selectedUser}
                            onlineStatus={false}
                        />

                    ))}

                </div>

                <div className='p-2 text-center flex items-center justify-between'>
                    <div className='flex items-center '>
                        <div className='mr-2 text-sm bg-[#FFE6C7] text-black font-semibold p-2 rounded-lg flex items-center gap-1 '>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        {username}
                    </div>
                    <button onClick={logout} className='text-sm bg-[#FFE6C7] text-black font-semibold p-2 rounded-lg hover:scale-110 shadow-md shadow-customGray'>logout</button>
                </div>
            </div>
            <div className='bg-gray-100 w-2/3 text-black rounded-r-lg p-2 flex flex-col mb-4'>
                <div className='flex-grow'>
                    {!selectedUser && (
                        <div className='flex h-full items-center justify-center text-black font-semibold'>
                            <div>
                                &larr; Select a user
                            </div>
                        </div>
                    )}
                    {!!selectedUser && (
                        <div className='relative h-full'>
                            <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2 '>
                                {uniqueMessages.map(msg => (
                                    <div key={msg._id} className={(msg.sender === UserId ? 'text-right' : 'text-left')}>
                                        <div key={msg._id} className={"text-white inline-block rounded-lg text-sm p-2 m-2 text-left " + (msg.sender === UserId ? 'bg-customGray' : 'bg-[#5e5d5d]')}>
                                            {msg.text}
                                            {msg.file && (
                                                <a target='_blank' className='flex items-center gap-1 underline' href={axios.defaults.baseURL + '/uploads/' + msg.file}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                                                    </svg>

                                                    {msg.file}

                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMsgBox}></div>
                            </div>
                        </div>

                    )

                    }

                </div>
                {!!selectedUser && (
                    <form className='flex gap-2 p-2' onSubmit={sendMessage}>
                        <input type='text'
                            value={newMsgText}
                            onChange={e => setNewMsgText(e.target.value)}
                            className='bg-white outline-none p-2 rounded-xl flex grow ' placeholder='text here....' />
                        <label type='button' className='bg-[#FFE6C7] text-black font-bold p-2 rounded-lg hover:scale-110 shadow-md cursor-pointer'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                            <input type='file' className='hidden' onChange={sendFile} />
                        </label>
                        <button className='bg-[#FFE6C7] text-black font-bold p-2 rounded-lg hover:scale-110 shadow-md' type='submit'>
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