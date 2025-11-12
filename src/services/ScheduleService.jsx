import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

/* ---------------------- 카테고리 ---------------------- */

// 카테고리 생성
export const createScheduleCategory = async (categoryName) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(
    `${API_BASE_URL}/schedules/category`,
    { name: categoryName },
    { headers: { Authorization: `${token}` } }
  );
  return response;
};

// 카테고리 조회
export const fetchScheduleCategories = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/schedules/category`, {
    headers: { Authorization: `${token}` },
  });
  return response.data.content || [];
};

// 카테고리 삭제
export const deleteScheduleCategory = async (categoryId) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.delete(
    `${API_BASE_URL}/schedules/category/${categoryId}`,
    { headers: { Authorization: `${token}` } }
  );
  return response.data === true;
};

/* ---------------------- 일정 ---------------------- */

// 일정 생성
export const createSchedule = async (scheduleData) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(`${API_BASE_URL}/schedules`, scheduleData, {
    headers: {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    },
  });
  return response;
};

// 일정 전체 목록 조회
export const fetchAllSchedules = async () => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/schedules`, {
    headers: { Authorization: `${token}` },
  });
  return response.data.content || [];
};

// 일정 상세 조회
export const fetchScheduleDetail = async (scheduleId, scheduleAt) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${API_BASE_URL}/schedules/${scheduleId}`, {
    headers: { Authorization: `${token}` },
    params: { scheduleAt },
  });
  return response.data;
};

// 일정 삭제
export const deleteSchedule = async (scheduleId, scheduleAt) => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.delete(
    `${API_BASE_URL}/schedules/${scheduleId}`,
    {
      headers: { Authorization: `${token}` },
      params: { scheduleAt },
    }
  );
  return response;
};