import React, { useState } from 'react'

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return (
    <div className="bg-gray-200 h-screen flex items-center">
      <form className='w-64 mx-auto p-5 flex-col mb-12  '>
        <input value={username} onChange={ev => setUsername(ev.target.value)}
          type="text" placeholder='username'
          className='block w-full rounded-sm p-2 mb-2 border' />
        <input value={password} onChange={ev => setPassword(ev.target.value)}
          type="password" placeholder='password' className='block w-full rounded-sm p-2 mb-2 border' />
        <button className='bg-black text-white block w-full rounded-sm p-2'>Register now!</button>

      </form>

    </div>
  )
}

export default Register