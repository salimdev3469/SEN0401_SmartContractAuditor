import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DetectionPage from './DetectionPage.jsx';
import LandingPage from './LandingPage.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  return (
    <> <ToastContainer
      position="top-right"
      autoClose={2000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="dark"
    />
      <BrowserRouter>
        <Routes>
          <Route path="/detect" element={<DetectionPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
    </>

  )
}

export default App;
