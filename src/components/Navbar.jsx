import React from 'react'
import { Link,useNavigate } from 'react-router-dom';


const Navbar = () => {
  const navigate=useNavigate();
    const handleLogin=()=>{
      navigate("/selectDashboards");
    };
  return (
    <div>

        <div className="bg-zinc-500 flex flex-row justify-between">
          <div className="logo">PriceNear</div>
          <div >
            <nav className="flex gap-7 ">
              <Link to="/">Home</Link>
              <Link to="/search">Search</Link>
              <Link to="/map">Map</Link>
              <Link to="/alerts">Alerts</Link>
            </nav>
          </div>
          <div className="login-btn">
            <button 
              onClick={()=>handleLogin()}>Login</button>
            
          </div>
        </div>
        
    </div>

  )
}

export default Navbar