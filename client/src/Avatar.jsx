import React from 'react'

const Avatar = ({username,UserId,online}) => {
    const colors = ['bg-red-200','bg-green-200','bg-purple-200','bg-blue-200', 'bg-yellow-100','bg-teal-200',]
    const userIdBase10 = parseInt(UserId,16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
  return (
    <div className={"w-8 h-8 relative rounded-full text-center flex items-center text-black bg-opacity-85 " + color}>
       <div className='text-center w-full opacity-70 font-semibold'>
       {username[0]}
       </div> 
       {online && (
         <div className='absolute w-2 h-2 bg-green-400 rounded-full border border-white shadow-white bottom-0 right-0'></div>
       )}
       {!online && (
         <div className='absolute w-2 h-2 bg-gray-400 rounded-full border border-white shadow-white bottom-0 right-0'></div>
       )}
       
    </div>
  )
}

export default Avatar