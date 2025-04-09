import './App.css';
import { useEffect } from 'react';
import Routing from './routes/Routing';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { subscribeNotification } from './services/SubscribeNotification.jsx'; 


function App() {
  useEffect(() => {
    subscribeNotification(); 
  }, []);


  return (
    <div className="App">
      <main>
				<Routing />
        <ToastContainer position="top-right" autoClose={5000} />
			</main>
    </div>
  );
}

export default App;
