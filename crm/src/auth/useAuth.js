import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });

  const login = (email, password) => {
    
    if (email === "admin@gmail.com" && password === "admin123") {
      const userData = { role: "admin", email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/admin/dashboard");
    } else if (email === "agent@gmail.com" && password === "agent123") {
      const userData = { role: "agent", email };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/agent/dashboard");
    } else {
      alert("Invalid credentials!");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  return { user, login, logout };
};
