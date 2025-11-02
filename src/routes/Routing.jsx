import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/commons/AppLayout.jsx";
import HomePage from "../pages/Home/HomePage.jsx";
import LoginPage from "../pages/Login/LoginPage.jsx";
import SignUpPage from "../pages/SignUp/SignUpPage.jsx";
import InputInfoPage from "../pages/SignUp/InputInfoPage.jsx";
import MainPage from "../pages/Main/MainPage.jsx";
import MyPage from "../pages/MyPage/MyPage.jsx";
import PetPage from "../pages/Pet/PetPage.jsx";
import FriendPage from "../pages/Friend/FriendPage.jsx";
import CommunityPage from "../pages/Community/CommunityPage.jsx";
import NotificationPage from "../pages/Notification/NotificationPage.jsx";
import SplashScreen from "../pages/SplashScreen.jsx";

const Routing = () => {
  return (
    <Routes>

      {/* 스플래시 */}
      <Route path="/splash" element={<SplashScreen />} />
      
      {/* NavBar 없는 라우트 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signUp" element={<SignUpPage />} />
      <Route path="/inputInfo" element={<InputInfoPage />} />

      {/* NavBar 포함 라우트 */}
      <Route element={<AppLayout />}>
        <Route path="/mainPage" element={<MainPage />} />
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/petPage" element={<PetPage />} />
        <Route path="/friendPage" element={<FriendPage />} />
        <Route path="/communityPage" element={<CommunityPage />} />
        <Route path="/notificationPage" element={<NotificationPage />} />
      </Route>
    </Routes>
  );
};

export default Routing;
