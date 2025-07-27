import { Outlet } from "react-router-dom";
import NavBar from "../../components/commons/NavBar";

const NAVBAR_HEIGHT = 60;

const AppLayout = () => {
  return (
    <>
      <NavBar />
      <div style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}>
        <Outlet />
      </div>
    </>
  );
};

export default AppLayout;