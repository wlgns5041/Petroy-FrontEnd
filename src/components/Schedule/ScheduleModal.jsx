import React, { useState, useEffect } from 'react';
import '../../styles/Main/ScheduleModal.css';
import defaultPetPic from '../../assets/images/DefaultImage.png';
import Calendar from 'react-calendar';  
import axios from 'axios';
import { FiInfo } from 'react-icons/fi';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ScheduleModal = ({ onClose, pets, onScheduleCreated }) => {
  const [formData, setFormData] = useState({
    categoryId: '',
    title: '',
    content: '',
    repeatYn: true, 
    noticeYn: false,
    noticeAt: 1,
    priority: 'LOW',
    petId: [],
    selectedDates: [], 
    isAllDay: false,
    repeatPattern: { 
      frequency: 'DAY',
      interval: 1,
      startDate: new Date().toISOString().slice(0, 16), 
      endDate: '',
      daysOfWeek: [],
      daysOfMonth: [],
    },
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/schedules/category`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        setCategories(response.data.content);
      } catch (error) {
        console.error('카테고리 로딩 중 오류 발생:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const now = new Date();
    const koreanTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const localDateTime = koreanTime.toISOString().slice(0, 16);
    setFormData((prevData) => ({
      ...prevData,
      repeatPattern: {
        ...prevData.repeatPattern,
        startDate: localDateTime,  
      },
    }));
  }, []);

  useEffect(() => {
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === 'repeatPattern.frequency') {
      setFormData((prevData) => ({
          ...prevData,
          repeatPattern: {
              ...prevData.repeatPattern,
              frequency: value,
              daysOfWeek: [], 
              daysOfMonth: [], 
          },
      }));

  } else if (name === 'repeatYn') {
      setFormData((prevData) => ({
        ...prevData,
        repeatYn: checked,
        repeatPattern: checked ? {
          frequency: 'DAY', 
          interval: 1, 
          startDate: new Date().toISOString().slice(0, 16),
          endDate: '', 
          daysOfWeek: [],
          daysOfMonth: [],
        } : {
          ...prevData.repeatPattern,
          frequency: '',
          interval: 1, 
          startDate: '', 
          endDate: '',
          daysOfWeek: [], 
          daysOfMonth: [], 
        },
        selectedDates: !checked ? [] : prevData.selectedDates, 
      }));

    } else if (name.startsWith('repeatPattern.')) { 
      const [, subKey] = name.split('.');
      setFormData((prevData) => ({
        ...prevData,
        repeatPattern: {
          ...prevData.repeatPattern,
          [subKey]: type === 'checkbox' ? checked : value,
        },
      }));

    } else if (name === 'categoryId') {
      setFormData((prevData) => ({
        ...prevData,
        [name]: Number(value),
      }));

    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const convertToKST = (date) => {
    const utcDate = new Date(date);
    const koreanTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000); // UTC +9시간
    return koreanTime.toISOString().replace('Z', ''); // ISO 형식으로 변환 후 Z 제거
  };  

  const dayMapping = {
    '일': 'SUNDAY',
    '월': 'MONDAY',
    '화': 'TUESDAY',
    '수': 'WEDNESDAY',
    '목': 'THURSDAY',
    '금': 'FRIDAY',
    '토': 'SATURDAY',
};

const handleDayClick = (day) => {
    const updatedDays = formData.repeatPattern.daysOfWeek.includes(dayMapping[day])
        ? formData.repeatPattern.daysOfWeek.filter((d) => d !== dayMapping[day])
        : [...formData.repeatPattern.daysOfWeek, dayMapping[day]];

    setFormData((prevData) => ({
        ...prevData,
        repeatPattern: {
            ...prevData.repeatPattern,
            daysOfWeek: updatedDays,
        },
    }));
};

  
  const handleDayOfMonthClick = (day) => {
    const updatedDays = formData.repeatPattern.daysOfMonth.includes(day)
      ? formData.repeatPattern.daysOfMonth.filter((d) => d !== day)
      : [...formData.repeatPattern.daysOfMonth, day];
  
    setFormData((prevData) => ({
      ...prevData,
      repeatPattern: {
        ...prevData.repeatPattern,
        daysOfMonth: updatedDays,
      },
    }));
  };

  const handlePetSelectionChange = (petId) => {
    setFormData((prevData) => ({
      ...prevData,
      petId: prevData.petId.includes(petId)
        ? prevData.petId.filter((id) => id !== petId)
        : [...prevData.petId, petId],
    }));
  };

  const handleDateChange = (date) => {
    // KST로 변환
    const localDate = new Date(date.getTime() + (9 * 60 * 60 * 1000)); // UTC +9시간
    const formattedDate = localDate.toISOString().slice(0, 10); // yyyy-mm-dd 형식
    setFormData((prevData) => {
      const existingDate = prevData.selectedDates.find(d => d.date === formattedDate);
      if (existingDate) {
        return {
          ...prevData,
          selectedDates: prevData.selectedDates.filter(d => d.date !== formattedDate),
        };
      } else {
        return {
          ...prevData,
          selectedDates: [...prevData.selectedDates, { date: formattedDate, time: '00:00' }],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
  
    const startDateTime = new Date(formData.repeatPattern.startDate);
    const endDateTime = new Date(formData.repeatPattern.endDate);
    const generatedDates = [];
  
    // 반복 유무에 따라 날짜 생성
    if (formData.repeatYn) {
      if (formData.repeatPattern.frequency === 'DAY') {
        // 일일 반복
        for (let date = new Date(startDateTime); date <= endDateTime; date.setDate(date.getDate() + formData.repeatPattern.interval)) {
          generatedDates.push(convertToKST(date));
        }
      } else if (formData.repeatPattern.frequency === 'WEEK') {
        const selectedDays = formData.repeatPattern.daysOfWeek;
  
        for (let date = new Date(startDateTime); date <= endDateTime; date.setDate(date.getDate() + 1)) {
          if (selectedDays.includes(new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date))) {
            generatedDates.push(convertToKST(date)); 
            date.setDate(date.getDate() + (formData.repeatPattern.interval - 1) * 7);
          }
        }
      } else if (formData.repeatPattern.frequency === 'MONTH') {
        const dayOfMonth = formData.repeatPattern.daysOfMonth;
        for (let date = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), 1); date <= endDateTime; date.setMonth(date.getMonth() + 1)) {
          dayOfMonth.forEach(day => {
            const monthlyDate = new Date(date.getFullYear(), date.getMonth(), day);
            if (monthlyDate >= startDateTime && monthlyDate <= endDateTime) {
              generatedDates.push(convertToKST(monthlyDate)); 
            }
          });
        }
      }
    } else {
      // 반복이 없을 때 선택한 날짜 추가
      if (formData.selectedDates && formData.selectedDates.length > 0) {
        formData.selectedDates.forEach(dateObj => {
          const date = new Date(dateObj.date); // 날짜 객체 생성
          const time = dateObj.time; // 시간 가져오기
          const [hours, minutes] = time.split(':'); // 시간 분리
          date.setHours(hours); // 시간 설정
          date.setMinutes(minutes); // 분 설정
  
          // 유효한 날짜인지 확인 후 KST 형식으로 변환
          if (!isNaN(date.getTime())) {
            generatedDates.push(convertToKST(date)); // KST 변환
          }
        });
      }
    }
  
    const requestData = {
      categoryId: formData.categoryId,
      title: formData.title,
      content: formData.content,
      repeatYn: formData.repeatYn,
      noticeYn: formData.noticeYn,
      priority: formData.priority,
      petId: formData.petId,
      isAllDay: formData.isAllDay,
    };

    // scheduleTime 설정
    if (formData.isAllDay) {
      requestData.scheduleTime = null; // 하루종일인 경우 null 전송
    } else {
      // '하루종일'이 아닐 때 사용자가 설정한 시간 포함
      requestData.scheduleTime = formData.scheduleTime || "00:00:00"; // 시간 설정, 없으면 기본값
    }
  
    if (formData.repeatYn) {
      requestData.repeatPattern = {
        frequency: formData.repeatPattern.frequency,
        interval: formData.repeatPattern.interval,
        startDate: formData.repeatPattern.startDate,
        endDate: formData.repeatPattern.endDate,
        ...(formData.repeatPattern.frequency === 'WEEK' && { daysOfWeek: formData.repeatPattern.daysOfWeek }),
        ...(formData.repeatPattern.frequency === 'MONTH' && { daysOfMonth: formData.repeatPattern.daysOfMonth }),
      };
    } else {
      requestData.selectedDates = formData.selectedDates.map(d => d.date); // yyyy-mm-dd 형식으로 전송
    }
  
    if (formData.noticeYn) {
      requestData.noticeAt = formData.noticeAt;
    }
  
    console.log("최종 요청 데이터:", requestData);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/schedules`, requestData, {
        headers: {
          Authorization: `${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        alert('일정이 생성되었습니다.');
        onScheduleCreated();
        onClose();
      }
    } catch (error) {
      const { data } = error.response;
      alert(data.errorMessage || '일정 생성 중 오류가 발생했습니다.');
    }
  };  
  
  return (
    <div className="schedule-modal-container">
      <div className="schedule-modal-content">
        <form onSubmit={handleSubmit}>
  
          <div className="schedule-section-card">
            <div className="input-group">
              <label>카테고리</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="" disabled>카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
  
            <div className="input-group">
              <label>제목</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="input-group">
              <label>내용</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
              />
            </div>
          </div>
  
          <div className="schedule-section-card">
  <label className="form-label">반려동물</label>
  <ul className="schedule-pet-select-container">
    {pets.map((pet) => (
      <li
        key={pet.petId}
        className={`schedule-pet-select-card ${formData.petId.includes(pet.petId) ? 'selected' : ''}`}
        onClick={() => handlePetSelectionChange(pet.petId)}
      >
        <img src={pet.imageUrl || defaultPetPic} alt={pet.name} />
        <div className="info">
          <div className="name">{pet.name}</div>
          <div className="species">{pet.breed}</div>
        </div>
      </li>
    ))}
  </ul>
</div>
  
          <div className="schedule-section-card">
            <div className="form-row between">
            <span className="form-label-with-info">
              반복 유무
              <div className="tooltip-container">
                <FiInfo className="info-icon" />
                <span className="tooltip-text"><span style={{ color: '#ff5a3c' }}>설정 시</span> 시작과 종료 날짜 사이에 선택한<br />
                                               주기와 간격으로 일정이 자동 생성합니다<br />
                                               <span style={{ color: '#ff5a3c' }}>설정 해제 시</span> 일정 날짜를 직접 선택합니다</span>
              </div>
            </span>
              <label className="switch">
                <input
                  type="checkbox"
                  name="repeatYn"
                  checked={formData.repeatYn}
                  onChange={handleChange}
                />
                <span className="slider round"></span>
              </label>
            </div>
  
            {formData.repeatYn && (
              <>
                <div className="form-row between">
                  <span className="form-label">반복 주기</span>
                  <select
                    name="repeatPattern.frequency"
                    value={formData.repeatPattern.frequency}
                    onChange={handleChange}
                  >
                    <option value="DAY">일일</option>
                    <option value="WEEK">주간</option>
                    <option value="MONTH">월간</option>
                  </select>
                </div>
  
                <div className="form-row between">
                  <span className="form-label-with-info">
                    반복 간격
                  <div className="tooltip-container">
                    <FiInfo className="info-icon" />
                    <span className="tooltip-text">
                    반복 주기마다 건너뛰는 간격을 의미하며<br /><span style={{ fontWeight: '600', color: '#ff5a3c' }}>주간(월간)</span>
                    으로 선택 시 <span style={{ fontWeight: '600', color: '#ff5a3c' }}>선택한 요일(날짜)</span>마다 <br /> 선택한 간격으로 반복합니다
                    </span>
                  </div>
                  </span>
                    <input
                      type="number"
                      name="repeatPattern.interval"
                      value={formData.repeatPattern.interval}
                      min="1"
                      onChange={handleChange}
                    />
                </div>
  
                {formData.repeatPattern.frequency === 'WEEK' && (
                  <div className="repeat-buttons">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-button ${formData.repeatPattern.daysOfWeek.includes(dayMapping[day]) ? 'selected' : ''}`}
                        onClick={() => handleDayClick(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
  
                {formData.repeatPattern.frequency === 'MONTH' && (
                  <div className="repeat-buttons">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        type="button"
                        className={`day-button ${formData.repeatPattern.daysOfMonth.includes(day) ? 'selected' : ''}`}
                        onClick={() => handleDayOfMonthClick(day)}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
  
          {formData.repeatYn && (
            <div className="schedule-section-card">
              <div className="form-row between">
                <span className="form-label">일정 반복 시작</span>
                <input
                  type="datetime-local"
                  name="repeatPattern.startDate"
                  value={formData.repeatPattern.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row between">
                <span className="form-label">일정 반복 종료</span>
                <input
                  type="datetime-local"
                  name="repeatPattern.endDate"
                  value={formData.repeatPattern.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
  
          {!formData.repeatYn && (
            <div className="schedule-section-card">
              <div className="form-row">
              <div className="selected-dates-title">날짜 선택</div>
                <Calendar
                  onChange={handleDateChange}
                  value={null}
                  className="custom-small-calendar"
                  tileClassName={({ date }) => {
                    const localDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
                    const formattedDate = localDate.toISOString().slice(0, 10);
                    return formData.selectedDates.some(selected => selected.date === formattedDate)
                      ? 'selected-date'
                      : '';
                  }}
                  selectRange={false}
                />
              </div>
  
              <div className="form-row">
              {formData.selectedDates.length > 0 && (
                <div className="form-row">
                  <div className="selected-dates">
                    <div className="selected-dates-title">선택된 날짜</div>
                    <div className="selected-dates-grid">
                      {formData.selectedDates.map((dateObj, index) => (
                        <div key={index} className="date-time-selection">
                          <span>{dateObj.date}</span>
                        </div>
                      ))}
                    </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}
  
          <div className="schedule-section-card">
            <div className="form-row between">
            <span className="form-label-with-info">
            하루종일
            <div className="tooltip-container">
              <FiInfo className="info-icon" />
              <span className="tooltip-text">
                시간 설정 없이 일정을 <span style={{ fontWeight: '600', color: '#ff5a3c' }}>하루 전체</span>로 간주됩니다
                <br />알림 설정 시 해당 날짜 자정 기준으로 설정됩니다
              </span>
            </div>
            </span>

            <label className="switch">
              <input
               type="checkbox"
               name="isAllDay"
               checked={formData.isAllDay}
               onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
          </div>
  
            {!formData.isAllDay && (
              <div className="form-row between">
                <span className="form-label">시간 설정</span>
                <input
                  type="time"
                  value={formData.scheduleTime || '00:00'}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
              </div>
            )}
          </div>
  
          <div className="schedule-section-card">
            <div className="form-row between">
              <span className="form-label">우선순위</span>
              <select
                name="priority"
                className="priority-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="LOW">낮음</option>
                <option value="MEDIUM">보통</option>
                <option value="HIGH">높음</option>
              </select>
            </div>
          </div>
  
          <div className="schedule-section-card">
          <div className="form-row between">
            <span className="form-label-with-info">
              알림 설정
              <div className="tooltip-container">
                <FiInfo className="info-icon" />
                <span className="tooltip-text">
                  <span style={{ fontWeight: '600', color: '#ff5a3c' }}>설정한 시간 전</span>에 일정 시작 알림을 받을 수 있습니다
                </span>
              </div>
            </span>

            <label className="switch">
              <input
                type="checkbox"
                name="noticeYn"
                checked={formData.noticeYn}
               onChange={handleChange}
              />
              <span className="slider round"></span>
            </label>
           </div>
  
            {formData.noticeYn && (
              <div className="form-row between">
                <span className="form-label">알림 시간</span>
                <select
                  name="noticeAt"
                  value={formData.noticeAt}
                  onChange={handleChange}
                  className="notice-select"
                  required
                  >
                  <option value={0}>시작 시 알림</option>
                  <option value={5}>5분 전</option>
                  <option value={10}>10분 전</option>
                  <option value={30}>30분 전</option>
                  <option value={60}>1시간 전</option>
                </select>
              </div>
            )}
          </div>
  
          <div className="button-container">
            <button type="submit" className="submit-btn">일정 생성</button>
            <button type="button" className="cancel-btn" onClick={onClose}>취소</button>
          </div>
  
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;