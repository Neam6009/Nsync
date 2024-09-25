import React, { useContext, useState } from 'react'

import axios from "axios"
import { UserContextProvider,UserContext } from './UserContext';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn,setIsLoggedIn] = useState(false);
  const {setUsername:setLoggedInUsername,setId} = useContext(UserContext);
  const handleSubmit = async (event)=>{
    event.preventDefault();
    const url = isLoggedIn? '/login' : '/register';
    const {data} = await axios.post(url,{username : username,password : password});
    setLoggedInUsername(username);
    setId(data._id);
    
  }

  
  return (
    <div className="bg-gray-200 h-screen flex items-center">
      <form className='w-64 mx-auto p-5 flex-col mb-12' onSubmit={handleSubmit}>
        <input value={username} onChange={ev => setUsername(ev.target.value)}
          type="text" placeholder='username'
          className='block w-full rounded-sm p-2 mb-2 border' />
        <input value={password} onChange={ev => setPassword(ev.target.value)}
          type="password" placeholder='password' className='block w-full rounded-sm p-2 mb-2 border' />
        <button className='bg-black text-white block w-full rounded-sm p-2'>
          {isLoggedIn? "Login" : "Register" }
          </button>
        <div className='text-center mt-2 flex-col'>
          {isLoggedIn? <div>
            <div>Not registered?</div>  
          <button onClick={()=>{ setIsLoggedIn(false)}}>Register now!</button> 
          </div> : <div>
          <div>Registered?</div>  
          <button onClick={()=>{ setIsLoggedIn(true)}}>Login now!</button> 
          </div> }
          
        </div>
      </form>

    </div>
  )
}

export default Register