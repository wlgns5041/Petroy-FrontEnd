import { Route, Routes } from 'react-router-dom';
import HomePage from '../pages/Home/HomePage.jsx';
import LoginPage from '../pages/Login/LoginPage.jsx';
import SignUpPage from '../pages/SignUp/SignUpPage.jsx';
import InputInfoPage from '../pages/SignUp/InputInfoPage.jsx';
import MainPage from '../pages/Main/MainPage.jsx';
import MyPage from '../pages/MyPage/MyPage.jsx';
import PetPage from '../pages/Pet/PetPage.jsx';  
import FriendPage from '../pages/Friend/FriendPage.jsx';
import CommunityPage from '../pages/Community/CommunityPage.jsx';

const Routing = () => {
	return (
		<Routes>
            <Route path='/login' element={<LoginPage/>} />
			<Route path='/inputInfo' element={<InputInfoPage/>} />
            <Route path='/signUp' element={<SignUpPage/>} />
			<Route path='/mainPage' element={<MainPage/>} />
			<Route path='/myPage' element={<MyPage/>} />
			<Route path='/petPage' element={<PetPage/>} />
			<Route path='/friendPage' element={<FriendPage/>} /> 
			<Route path='/communityPage' element={<CommunityPage/>} /> 
			<Route path='/' element={<HomePage/>} />
            
		</Routes>
	);
};

export default Routing;

