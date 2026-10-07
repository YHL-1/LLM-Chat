import {createBrowserRouter} from "react-router-dom";
import Home from "../views/home/index";
import Chat from "../views/chat/index";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>
    },
    {
        path: "/chat",
        element: <Chat/>
    }])

    export default router;