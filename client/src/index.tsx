import React, { useState, useEffect } from 'react';
import ReactDom from 'react-dom';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
//element imports:
import App from './components/App';
import Navbar from './components/Navbar';
import BulletinBoard from './components/BulletinBoard/BulletinBoard';
import Weather from './components/Weather/Weather';
import RouteM from './components/Routes/RouteM';
import Navbar from './components/Navbar';

// import Home from './home';
// import Andrew from './Andrew';
// import Ernest from './Ernest';
// import Brendan from './Brendan';
// import Jordan from './Jordan';

const root: any = createRoot(document.getElementById('app'));
// export const UserContext = React.createContext();
//below here, the HTML should eventually be wrapped in <UserContextProvider> tags
//our individual components will be rendered w/ individual <Route> tags
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />} />
      <Route path='home' element=
        <Route path='bulletinBoard' element={<BulletinBoard />} />
        <Route path='forecast' element={<Weather />} />
        <Route path='routes' element={<RouteM />} />
        {/*<Route path='/home' element={<Home/>} />
      <Route path='/Andrew' element={<Andrew/>} />
      <Route path='/Ernest' element={<Ernest/>} />
      <Route path='/Brendan' element={<Brendan/>} />
      <Route path='/Jordan' element={<Jordan/>} /> */}
    </Routes>
  </BrowserRouter>
);
