import "./App.css";
import { useEffect } from "react";
import Routing from "./routes/Routing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { subscribeNotification } from "./services/NotificationService.jsx";

function App() {
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    subscribeNotification();

    return () => {};
  }, []);

  return (
    <div className="App">
      <Routing />
      <ToastContainer
        containerId="global-toasts"
        position="top-right"
        newestOnTop
        closeOnClick={false}
        pauseOnHover
        draggable
        className="toast-portal"
        toastClassName="toast-card"
        bodyClassName="toast-body"
      />
    </div>
  );
}

export default App;
