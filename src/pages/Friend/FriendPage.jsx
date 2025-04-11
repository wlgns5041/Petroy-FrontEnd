import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FriendSearch from '../../components/Friend/FriendSearch.jsx';
import NavBar from '../../components/commons/NavBar.jsx';
// import FriendDetail from '../../components/Friend/FriendDetail.jsx';
import FriendList from '../../components/Friend/FriendList.jsx';
import FriendRequestsList from '../../components/Friend/FriendRequestList.jsx';
// import defaultProfilePic from '../../assets/images/DefaultImage.png';
import '../../styles/Friend/FriendPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const FriendPage = () => {
    const [activeTab, setActiveTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);

    const fetchFriends = async () => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/friends`, {
            params: { status: 'ACCEPTED' },
            headers: { 'Authorization': `${token}` },
        });
        setFriends(response.data.content || []);
    };

    const fetchRequests = async () => {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/friends`, {
            params: { status: 'PENDING' },
            headers: { 'Authorization': `${token}` },
        });
        setRequests(response.data.content || []);
    };

    const handleRequestAction = async (memberId, action) => {
        const token = localStorage.getItem('accessToken');
        await axios.patch(`${API_BASE_URL}/friends/${memberId}`, {}, {
            headers: { 'Authorization': `${token}` },
            params: { status: action },
        });

        if (action === 'ACCEPTED') {
            const accepted = requests.find(r => r.id === memberId);
            setFriends([...friends, accepted]);
        }
        setRequests(requests.filter(r => r.id !== memberId));
    };

    useEffect(() => {
        fetchFriends();
        fetchRequests();
    }, []);

    return (
        <div className="friendPageContainer">
            <NavBar title="친구" />

            <div className="card">
                <div className="tabBar">
                    <button 
                        className={activeTab === 'friends' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('friends')}
                    >
                        친구 목록
                    </button>
                    <button 
                        className={activeTab === 'search' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('search')}
                    >
                        친구 요청
                    </button>
                    <button 
                        className={activeTab === 'manage' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('manage')}
                    >
                        친구 요청 관리
                    </button>
                </div>

                <div className="tabContent">
                    {activeTab === 'friends' && (
                        <FriendList 
                            friends={friends}
                        />
                    )}
                    {activeTab === 'search' && (
                        <FriendSearch />
                    )}
                    {activeTab === 'manage' && (
                        <FriendRequestsList 
                            requests={requests}
                            onRequestAction={handleRequestAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendPage;