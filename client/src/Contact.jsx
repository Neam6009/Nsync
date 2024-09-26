import React from 'react'
import Avatar from './Avatar'

const Contact = ({ uid, selected, username, onClick, onlineStatus }) => {
    return (
        <div key={uid} className={selected ? "bg-gray-50 bg-opacity-20 rounded-lg mr-4 flex-grow" : "mr-4 flex-grow "}>
            <div key={uid} onClick={() => onClick(uid)} className='border-gray-50 py-2 bg-gray-50 bg-opacity-5 cursor-pointer
                    flex gap-2 items-center hover:bg-gray-50 hover:bg-opacity-20  rounded-lg  transition duration-300 pl-2 mb-2'>
                <Avatar online={onlineStatus} username={username} UserId={uid} />
                <span className='text-gray-50'>
                    {username}
                </span>
            </div>
        </div>
    )
}

export default Contact