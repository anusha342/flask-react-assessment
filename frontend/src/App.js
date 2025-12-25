import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TaskManager from './components/TaskManager';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="header">
        <h1>Task Manager</h1>
        <p>Your tasks, beautifully managed</p>
      </div>

      <TaskManager />

      <ToastContainer
        position="bottom-center"
        autoClose={2500}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        toastStyle={{
          borderRadius: '10px',
          fontSize: '0.9rem',
          background: '#fffdf9',
          color: '#3d3529',
          border: '1px solid #e8e2d9',
          boxShadow: '0 4px 20px rgba(61,53,41,0.15)'
        }}
      />
    </div>
  );
}

export default App;
