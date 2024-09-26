import React, { useContext, useState } from 'react'

import axios from "axios"
import { UserContextProvider, UserContext } from './UserContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = isLoggedIn ? '/login' : '/register';
    if (username !== '' && password != '') {
      const { data } = await axios.post(url, { username: username, password: password });
      setLoggedInUsername(username);
      setId(data._id);
    }

  }


  return (
    <div className="bg-gray-200 ">
    <div className="bg-gray-200 h-screen flex items-center flex-col flex-grow gap-10 overflow-hidden   ">
      <div className='h-1/3 py-4 px-10 mt-10 flex items-center  rounded-lg'>
        <h1 className='text-9xl font-Waterfall font-bold'>NSync</h1>
      </div>
      <form className='w-64 mx-auto  flex-col mb-12 ' onSubmit={handleSubmit}>
        <input value={username} onChange={ev => setUsername(ev.target.value)}
          type="text" placeholder='username'
          className='block w-full rounded-lg p-2 mb-2 border outline-none' />
        <input value={password} onChange={ev => setPassword(ev.target.value)}
          type="password" placeholder='password' className='block w-full rounded-lg p-2 mb-2 border outline-none'  />
        <button className='bg-black text-white block w-full rounded-lg p-2 hover:scale-105 shadow-md'>
          {isLoggedIn ? "Login" : "Register"}
        </button>
        <div className='text-center mt-2 flex'>
          {isLoggedIn ? <div className='flex text-sm items-center flex-grow justify-end gap-2' >
            <div>Not registered?</div>
            <div>
              <button className='bg-[#FFE6C7] rounded-lg p-2 font-semibold hover:scale-110 shadow-md' onClick={() => { setIsLoggedIn(false) }} type='button'>Register here</button>
            </div>
          </div> : <div className='flex text-sm items-center justify-end flex-grow gap-2'>
            <div>Registered?</div>
            <button className='bg-[#FFE6C7] rounded-lg p-2 font-semibold hover:scale-110 shadow-md' onClick={() => { setIsLoggedIn(true) }} type='button'>Login here</button>
          </div>}

        </div>
      </form>

    </div>

    </div>
  )
}

export default Register