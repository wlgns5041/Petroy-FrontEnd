import React, { useState } from "react";
import "../../styles/CalendarComponent.css";
import "font-awesome/css/font-awesome.min.css";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import dogChihuahua from "../../assets/icons/dog-chihuahua.png";
import dogJindo from "../../assets/icons/dog-jindo.png";
import dogPomeranian from "../../assets/icons/dog-pomeranian.png";
import catCheese from "../../assets/icons/cat-cheese.png";
import catMunchkin from "../../assets/icons/cat-munchkin.png";
import catRussianBlue from "../../assets/icons/cat-russianblue.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CalendarComponent = ({ filteredSchedules, onOpenDetail }) => {
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  const getStartOfMonth = () => {
    const firstDay = new Date(year, month, 1);
    const start = new Date(firstDay);
    start.setDate(1 - firstDay.getDay());
    return start;
  };

  const getEndOfMonth = () => {
    const lastDay = new Date(year, month + 1, 0);
    const end = new Date(lastDay);
    end.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    return end;
  };

  const groupDatesByWeek = (start, end) => {
    const weeks = [];
    let current = new Date(start);
    let week = [];
    while (current <= end) {
      week.push(new Date(current));
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      current.setDate(current.getDate() + 1);
    }
    if (week.length > 0) weeks.push(week);
    return weeks;
  };

  const getCurrentWeekDates = () => {
    const baseDate = new Date(currentDate);
    const week = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      week.push(date);
    }
    return [week];
  };

  const weeks =
    viewMode === "month"
      ? groupDatesByWeek(getStartOfMonth(), getEndOfMonth())
      : getCurrentWeekDates();

  const currentMonthStr = new Date(currentDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Seoul",
  });

  const fallbackIcons = {
    "강아지-치와와": dogChihuahua,
    "강아지-진돗개": dogJindo,
    "강아지-포메라니안": dogPomeranian,
    "고양이-치즈": catCheese,
    "고양이-먼치킨": catMunchkin,
    "고양이-러시안블루": catRussianBlue,
  };

  const getPetIcon = (species, breed) => {
    const key = `${species}-${breed}`;
    return fallbackIcons[key] || "/defaultPet.png";
  };

  return (
    <div className="calendar">
      {/* 상단 네비게이션 바 */}
      <div className="calendar-top-bar">
        {viewMode === "month" ? (
          <div className="calendar-nav-left styled-nav calendar-week-nav-custom">
            <div className="nav-button-left">
              <button
                className="nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="styled-title">
              {year}년 {month + 1}월
            </span>

            <div className="nav-button-right">
              <button
                className="nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              >
                <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        ) : (
          <div className="calendar-week-nav styled-nav calendar-week-nav-custom">
            <div className="nav-button-left">
              <button
                className="nav-rounded-button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="styled-title">
              {weeks[0][0].getMonth() + 1}월 {weeks[0][0].getDate()}일 ~{" "}
              {weeks[0][6].getMonth() + 1}월 {weeks[0][6].getDate()}일
            </span>

            <div className="nav-button-right">
              <button
                className="nav-rounded-button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() + 7);
                  setCurrentDate(newDate);
                }}
              >
                <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        )}

        <div className="calendar-view-tabs">
          <button
            className={`view-tab ${viewMode === "week" ? "active" : ""}`}
            onClick={() => {
              setCurrentDate(new Date());
              setViewMode("week");
            }}
          >
            주간 보기
          </button>
          <button
            className={`view-tab ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
          >
            월간 보기
          </button>
        </div>
      </div>

      {/* 주간 보기 섹션 (가로 배치: 미니 + 캘린더) */}
      {viewMode === "week" && (
        <div className="calendar-top-section">
          <div className="mini-month-calendar">
            <div className="mini-month-header">{currentMonthStr}</div>
            {groupDatesByWeek(getStartOfMonth(), getEndOfMonth()).map(
              (week, i) => (
                <div key={i} className="mini-week-row">
                  {week.map((date, j) => {
                    const isInSelectedWeek = weeks[0].some(
                      (w) => w.toDateString() === date.toDateString()
                    );

                    const isToday =
                      date.toLocaleDateString("sv-SE", {
                        timeZone: "Asia/Seoul",
                      }) === todayStr;

                      const isSelectedDate =
  date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) ===
  currentDate.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });


                    return (
                      <div
                      key={j}
                      className={`mini-day ${
                        isInSelectedWeek ? "highlight-week" : ""
                      } ${isToday ? "mini-today" : ""} ${isSelectedDate ? "selected-date" : ""}`}
                      onClick={() => setCurrentDate(date)}
                    >
                      {date.getDate()}
                    </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* 주간 달력 본체 */}
          <div className="calendar-content">
            <div className="weekdays">
              {weeks[0].map((date, idx) => (
                <div key={idx}>
                  {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                </div>
              ))}
            </div>

            <div className="days view-week">
              {weeks.map((week, i) => (
                <div key={i} className="week">
                  {week.map((date, j) => {
                    const localDateStr = new Date(date).toLocaleDateString(
                      "sv-SE",
                      {
                        timeZone: "Asia/Seoul",
                      }
                    );

                    const isBaseDate =
                      date.toLocaleDateString("sv-SE", {
                        timeZone: "Asia/Seoul",
                      }) ===
                      currentDate.toLocaleDateString("sv-SE", {
                        timeZone: "Asia/Seoul",
                      });

                    const isToday = localDateStr === todayStr;

                    const schedulesForDate = filteredSchedules.filter(
                      (s) =>
                        new Date(s.date).toISOString().split("T")[0] ===
                        localDateStr
                    );

                    return (
                      <div
                        key={j}
                        className={`day ${isBaseDate ? "base-date" : ""}`}
                        onClick={() => setCurrentDate(date)}
                      >
                        <div className={`day-number ${isToday ? "today" : ""}`}>
                          {date.getDate()}
                        </div>
                        <div className="schedule-details">
                          {schedulesForDate.map((s, index) => (
                            <div
                              key={index}
                              className={`schedule-box priority-${
                                s.priority?.toLowerCase() || "normal"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDetail(s.scheduleId, s.date);
                              }}
                            >
                              {s.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 월간 보기 본체 */}
      {viewMode === "month" && (
        <>
          <div className="weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>
          <div className="days view-month">
            {weeks.map((week, i) => (
              <div key={i} className="week">
                {week.map((date, j) => {
                  const localDateStr = new Date(date).toLocaleDateString(
                    "sv-SE",
                    {
                      timeZone: "Asia/Seoul",
                    }
                  );
                  const isToday = localDateStr === todayStr;
                  const isOtherMonth =
                    date.getMonth() !== currentDate.getMonth();

                  const schedulesForDate = filteredSchedules.filter(
                    (s) =>
                      new Date(s.date).toISOString().split("T")[0] ===
                      localDateStr
                  );

                  return (
                    <div
                      key={j}
                      className="day"
                      onClick={() => {
                        setCurrentDate(date);
                        setViewMode("week");
                      }}
                    >
                      <div
                        className={`day-number ${isToday ? "today" : ""} ${
                          isOtherMonth ? "other-month" : ""
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      <div className="schedule-details">
                        {schedulesForDate.map((s, index) => (
                          <div
                            key={index}
                            className={`schedule-box priority-${
                              s.priority?.toLowerCase() || "normal"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenDetail(s.scheduleId, s.date);
                            }}
                          >
                            {s.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 주간 일정 요약 */}
      {viewMode === "week" && (
        <div className="weekly-summary-table-rows">
          {weeks[0].map((date, idx) => {
            const localDateStr = new Date(date).toLocaleDateString("sv-SE", {
              timeZone: "Asia/Seoul",
            });

            const schedules = filteredSchedules.filter(
              (s) =>
                new Date(s.date).toISOString().split("T")[0] === localDateStr
            );

            return (
              <div key={idx} className="summary-date-block">
                <div className="summary-date-column">
                  <div className="weekday-text">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="day-number-large">{date.getDate()}</div>
                </div>

                <div className="summary-schedule-blocks">
                  {schedules.length > 0 ? (
                    schedules.map((s, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <hr className="schedule-divider-hr" />}
                        <div className="schedule-card-wide">
                          {/* 시간 + 카테고리 */}
                          <div className="summary-time-category">
                            <div className="date-text">
                              <AccessTimeFilledRoundedIcon
                                fontSize="small"
                                className="summary-icon"
                              />
                              {new Date(s.date).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="category-text">
                              <CategoryRoundedIcon
                                fontSize="small"
                                className="summary-icon"
                              />
                              {s.categoryName || "카테고리 없음"}
                            </div>
                          </div>

                          {/* 제목 + 펫 */}
                          <div className="summary-title-pets">
                            <div className="schedule-title">{s.title}</div>
                            <div className="schedule-pets">
                              {(s.petInfo || []).map((pet, i) => {
                                const imageSrc = pet.image
                                  ? pet.image.startsWith("http") ||
                                    pet.image.startsWith("data:")
                                    ? pet.image
                                    : `${API_BASE_URL}${pet.image}`
                                  : getPetIcon(pet.species, pet.breed);

                                return (
                                  <div key={i} className="pet-circle-with-name">
                                    <div className="pet-circle">
                                      <img
                                        src={imageSrc}
                                        alt={pet.name}
                                        title={pet.name}
                                        className="schedule-pet-thumbnail"
                                      />
                                    </div>
                                    <span className="pet-name">{pet.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 중요도 + 상세보기 */}
                          <div className="summary-actions">
                            <span
                              className={`priority-badge ${s.priority?.toLowerCase()}`}
                            >
                              {s.priority}
                            </span>
                            <button
                              className="styled-detail-button"
                              onClick={() => onOpenDetail(s.scheduleId, s.date)}
                            >
                              상세보기
                              <InfoRoundedIcon
                                className="styled-detail-icon"
                                fontSize="small"
                              />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="no-schedule">일정 없음</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
