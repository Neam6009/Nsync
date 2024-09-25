import { useContext, useState } from 'react'
import Register from './RegisterAndLogin.jsx'
import axios from 'axios'
import { UserContext, UserContextProvider } from './UserContext.jsx';
import Routes from './Routes.jsx';

function App() {
 axios.defaults.baseURL = "http://localhost:4000";
 axios.defaults.withCredentials = true;
 const {username} = useContext(UserContext);

  return (
    <UserContextProvider>
    <Routes/>
    </UserContextProvider>
  )
}

export default App
