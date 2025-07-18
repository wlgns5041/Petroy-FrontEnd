import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Friend/FriendPage.css";
import defaultProfilePic from "../../assets/images/DefaultImage.png";
import NavBar from "../../components/commons/NavBar.jsx";
import SearchIcon from "@mui/icons-material/Search";
import FriendList from "../../components/Friend/FriendList.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const FriendPage = () => {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  const fetchFriends = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/friends`, {
      params: { status: "ACCEPTED" },
      headers: { Authorization: `${token}` },
    });
    setFriends(response.data.content || []);
  };

  const fetchRequests = async () => {
    const token = localStorage.getItem("accessToken");
    const response = await axios.get(`${API_BASE_URL}/friends`, {
      params: { status: "PENDING" },
      headers: { Authorization: `${token}` },
    });
    setRequests(response.data.content || []);
  };

  const handleRequestAction = async (memberId, action) => {
    const token = localStorage.getItem("accessToken");
    await axios.patch(
      `${API_BASE_URL}/friends/${memberId}`,
      {},
      {
        headers: { Authorization: `${token}` },
        params: { status: action },
      }
    );

    const accepted = requests.find((r) => r.id === memberId);

    if (action === "ACCEPTED") {
      setFriends([...friends, accepted]);
      alert(`'${accepted.name}' 님과 친구가 되었습니다.`);
    }

    setRequests(requests.filter((r) => r.id !== memberId));
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("친구의 이름 또는 아이디를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_BASE_URL}/friends/search`, {
        params: { keyword },
        headers: { Authorization: `${token}` },
      });

      if (response.data && Array.isArray(response.data.content)) {
        setSearchResults(response.data.content);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      setError("친구 검색 중 오류 발생");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (memberId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        `${API_BASE_URL}/friends/${memberId}`,
        {},
        {
          headers: { Authorization: `${token}` },
        }
      );
      alert("친구 요청을 보냈습니다.");
    } catch (error) {
      alert("친구 요청에 실패했습니다.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setError("");
    }
  }, [keyword]);

  return (
    <div className="friendPageContainer">
      <NavBar title="친구" />

      {/* 검색창 */}
      <div className="friendSearchBar">
        <input
          type="text"
          placeholder="친구의 이름 및 아이디를 검색해주세요"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          className="searchIconButton"
          onClick={handleSearch}
          disabled={loading}
        >
          <SearchIcon />
        </button>
      </div>

      {/* 검색 결과 */}
      {keyword && (
        <div className="search-results">
          {error && <div className="search-results-error-message">{error}</div>}
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((member) => {
                const isAlreadyFriend = friends.some((f) => f.id === member.id); 

                return (
                  <li key={member.id} className="search-result-item">
                    <div className="search-result-info">
                      <img
                        src={member.image || defaultProfilePic}
                        alt={member.name}
                        className="profile-image"
                      />
                      <span>{member.name}</span>
                    </div>

                    {isAlreadyFriend ? (
                      <button className="send-request-button disabled" disabled>
                        이미 친구입니다
                      </button>
                    ) : (
                      <button
                        className="send-request-button"
                        onClick={() => handleSendRequest(member.id)}
                      >
                        친구 요청
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            !loading && <p className="no-results">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {/* 탭 메뉴 */}
      {!keyword && (
        <>
          <div className="tabBar">
            <button
              className={`tab ${activeTab === "friends" ? "active" : ""}`}
              onClick={() => setActiveTab("friends")}
            >
              <span className="tabLabel">
                <span className="tabText">친구 목록</span>
                <span className="friendCount">{friends.length}</span>
              </span>
            </button>
            <button
              className={`tab ${activeTab === "manage" ? "active" : ""}`}
              onClick={() => setActiveTab("manage")}
            >
              <span>친구 요청 관리</span>
            </button>
          </div>

          <div className="tabContent">
            {activeTab === "friends" && (
              <FriendList friends={friends} title="친구 목록" />
            )}
            {activeTab === "manage" && (
              <FriendList
                friends={requests}
                onAccept={(id) => handleRequestAction(id, "ACCEPTED")}
                onReject={(id) => handleRequestAction(id, "REJECTED")}
                title="친구 요청 관리"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FriendPage;
