import React, { useState, useEffect } from "react";
import "../../styles/Friend/FriendPage.css";
import SearchIcon from "@mui/icons-material/Search";
import FriendList from "../../components/Friend/FriendList.jsx";
import {
  fetchAcceptedFriends,
  fetchPendingFriends,
  handleFriendRequest,
  searchFriends,
  sendFriendRequest,
} from "../../services/FriendService";
import withAuth from "../../utils/withAuth";
import AlertModal from "../../components/commons/AlertModal.jsx";
import ProfileImage from "../../components/commons/ProfileImage.jsx";

const FriendPage = () => {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("friends");
  const friendTabIndex = activeTab === "friends" ? 0 : 1;

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const loadFriends = async () => {
    try {
      const data = await fetchAcceptedFriends();
      setFriends(data);
    } catch (error) {
      if (error._handledGlobally || error?.response?._handledGlobally) return;
      const message =
        error.response?.data?.message ||
        "친구 목록을 불러오는 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  const loadRequests = async () => {
    try {
      const data = await fetchPendingFriends();
      setRequests(data);
      const pendingIds = data.map((r) => r.id);
      setRequestedIds(pendingIds);
    } catch (error) {
      if (error._handledGlobally || error?.response?._handledGlobally) return;
      const message =
        error.response?.data?.message ||
        "친구 요청 목록을 불러오는 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  const handleRequestAction = async (memberId, action) => {
    try {
      await handleFriendRequest(memberId, action);
      const accepted = requests.find((r) => r.id === memberId);

      if (action === "ACCEPTED") {
        setFriends([...friends, accepted]);
        setAlertMessage(`'${accepted.name}' 님과 친구가 되었습니다.`);
        setShowAlert(true);
      }

      setRequests(requests.filter((r) => r.id !== memberId));
    } catch (error) {
      if (error._handledGlobally || error?.response?._handledGlobally) return;
      const message =
        error.response?.data?.message ||
        "친구 요청 처리 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("친구의 이름 또는 아이디를 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await searchFriends(keyword);
      setSearchResults(result);
    } catch (error) {
      if (error._handledGlobally || error?.response?._handledGlobally) return;
      const message =
        error.response?.data?.message || "친구 검색 중 오류가 발생했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (memberId) => {
    try {
      await sendFriendRequest(memberId);
      setRequestedIds((prev) => [...prev, memberId]);
      setAlertMessage("친구 요청을 보냈습니다.");
      setShowAlert(true);
    } catch (error) {
      if (error._handledGlobally || error?.response?._handledGlobally) return;
      const message =
        error.response?.data?.message || "친구 요청에 실패했습니다.";
      setAlertMessage(message);
      setShowAlert(true);
    }
  };

  useEffect(() => {
    loadFriends();
    loadRequests();
  }, []);

  useEffect(() => {
    if (!keyword.trim()) {
      setSearchResults([]);
      setError("");
    }
  }, [keyword]);

  return (
    <main className="friendpage-viewport">
      <div className="friendpage">
        <div className="friendpage-search-bar">
          <input
            type="text"
            placeholder="친구의 이름 및 아이디를 검색해주세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            className="friendpage-search-icon-button"
            onClick={handleSearch}
            disabled={loading}
          >
            <SearchIcon />
          </button>
        </div>

        {keyword && (
          <div className="friendpage-search-results">
            {error && (
              <div className="friendpage-search-results-error-message">
                {error}
              </div>
            )}
            {searchResults.length > 0 ? (
              <ul>
                {searchResults.map((member) => {
                  const isAlreadyFriend = friends.some(
                    (f) => f.id === member.id
                  );

                  return (
                    <li
                      key={member.id}
                      className="friendpage-search-result-item"
                    >
                      <div className="friendpage-search-result-info">
                        <ProfileImage
                          src={member.image}
                          alt={member.name}
                          className="friendpage-profile-image"
                        />
                        <span>{member.name}</span>
                      </div>

                      {isAlreadyFriend ? (
                        <button
                          className="friendpage-send-request-button disabled"
                          disabled
                        >
                          이미 친구입니다
                        </button>
                      ) : requestedIds.includes(member.id) ? (
                        <button
                          className="friendpage-send-request-button disabled"
                          disabled
                        >
                          친구 요청중입니다
                        </button>
                      ) : (
                        <button
                          className="friendpage-send-request-button"
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
              !loading && (
                <p className="friendpage-no-results">검색 결과가 없습니다.</p>
              )
            )}
          </div>
        )}

        {!keyword && (
          <>
            <div className="friendpage-tab-bar">
              <div
                className="friendpage-tab-background"
                style={{ transform: `translateX(${friendTabIndex * 100}%)` }}
              />

              <button
                className={`friendpage-tab ${
                  activeTab === "friends" ? "active" : ""
                }`}
                onClick={() => setActiveTab("friends")}
              >
                <span className="friendpage-tab-label">
                  <span className="friendpage-tab-text">친구 목록</span>
                  <span className="friendpage-friend-count">
                    {friends.length}
                  </span>
                </span>
              </button>

              <button
                className={`friendpage-tab ${
                  activeTab === "manage" ? "active" : ""
                }`}
                onClick={() => setActiveTab("manage")}
              >
                <span className="friendpage-tab-label">
                  <span className="friendpage-tab-text">친구 요청 관리</span>
                  <span className="friendpage-friend-count">
                    {requests.length}
                  </span>
                </span>
              </button>
            </div>

            <div className="friendpage-tab-content">
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

      {showAlert && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setShowAlert(false)}
        />
      )}
    </main>
  );
};

export default withAuth(FriendPage);
