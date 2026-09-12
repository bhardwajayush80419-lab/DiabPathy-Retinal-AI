import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard'; // Naya Dashboard yahan import ho raha hai

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />
  }

  // Ab yahan purane text ki jagah tera naya UI render hoga
  return <Dashboard onLogout={() => setIsLoggedIn(false)} />;
}