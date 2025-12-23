import { Route, Routes } from "react-router-dom";
import AppLayout from "../components/commons/AppLayout.jsx";
import withAuth from "../utils/withAuth";

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
import KakaoCallbackPage from "../pages/SignUp/KakaoCallbackPage.jsx";

const MainPageWithAuth = withAuth(MainPage);
const MyPageWithAuth = withAuth(MyPage);
const PetPageWithAuth = withAuth(PetPage);
const FriendPageWithAuth = withAuth(FriendPage);
const CommunityPageWithAuth = withAuth(CommunityPage);
const NotificationPageWithAuth = withAuth(NotificationPage);

const Routing = () => {
  return (
    <Routes>
      {/* SplashScreen */}
      <Route path="/splash" element={<SplashScreen />} />

      {/* NavBar 없는 라우트 + 비인증 라우트 */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signUp" element={<SignUpPage />} />
      <Route path="/inputInfo" element={<InputInfoPage />} />
      <Route path="/oauth/kakao/callback" element={<KakaoCallbackPage />} />

      {/* NavBar 포함 라우트 + 인증 필요 라우트 */}
      <Route element={<AppLayout />}>
        <Route path="/mainPage" element={<MainPageWithAuth />} />
        <Route path="/myPage" element={<MyPageWithAuth />} />
        <Route path="/petPage" element={<PetPageWithAuth />} />
        <Route path="/friendPage" element={<FriendPageWithAuth />} />
        <Route path="/communityPage" element={<CommunityPageWithAuth />} />
        <Route path="/notificationPage" element={<NotificationPageWithAuth />} />
      </Route>
    </Routes>
  );
};

export default Routing;