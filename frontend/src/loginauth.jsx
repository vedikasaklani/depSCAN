import "./loginauth.css"
import { useNavigate } from "react-router-dom";
function LoginPage(){
    const navigate=useNavigate();
    return (
        <div id="parent-container">
        <div className="container" style={{
            backgroundColor:"var(--black)",
            color:"var(--textlight)",
            height:"400px",
            width:"500px",
            display:"flex",
            flexDirection:"column",
            flex:1,
            gap:"1em",
            textAlign:"center",
            alignItems:"center"
            }}>
        <div><h1>Login</h1></div>
        <img src="/public/logo.png"></img>
        <button>Continue with Github</button>
        <button>Continue with Google</button>
        <button onClick= {() =>navigate("/projects")}>Dev skip login</button>
        </div></div>
    )
}
export default LoginPage;