import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import PrivateRoutesUser from "./components/PrivateRoutesUser";
import PrivateRoutesAuth from "./components/PrivateRoutesAuth";
import Conversation from "./pages/Conversation";
import Server from "./pages/Server";
import ServerSettings from "./pages/ServerSettings";
import ProfileSettings from "./pages/ProfileSettings";

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<PrivateRoutesUser />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/conversation/:conversationId" element={<Conversation />} />
                    <Route path="/server/:serverId" element={<Server />} />
                    <Route path="/server/:serverId/settings" element={<ServerSettings />} />
                    <Route path="/profile" element={<ProfileSettings />} />
                </Route>
                <Route element={<PrivateRoutesAuth />}>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                </Route>
            </Routes>
            <Toaster
                toastOptions={{
                    style: {
                        fontSize: "1.4rem",
                        fontWeight: 600,
                        color: "black"
                    }
                }}
            />
        </Router>
    );
}

export default App;
