import React, { useState } from "react";
import "../../styles/Main/CalendarComponent.css";
import "font-awesome/css/font-awesome.min.css";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import defaultPetPic from "../../assets/images/DefaultImage.png";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const CalendarComponent = ({ filteredSchedules, onOpenDetail }) => {
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const tabIndex = viewMode === "week" ? 0 : 1;

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
    for (let i = 0; i <= 6; i++) {
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

  return (
    <div className="calendar">
      {/* 상단 네비게이션 바 */}
      <div className="calendar-top-bar">
        {viewMode === "month" ? (
          <div className="calendar-nav-left calendar-styled-nav calendar-week-nav-custom">
            <div className="calendar-nav-button-left">
              <button
                className="calendar-nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="calendar-styled-title">
              {year}년 {month + 1}월
            </span>

            <div className="calendar-nav-button-right">
              <button
                className="calendar-nav-rounded-button"
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              >
                <i className="fa fa-arrow-right" />
              </button>
            </div>
          </div>
        ) : (
          <div className="calendar-week-nav calendar-styled-nav calendar-week-nav-custom">
            <div className="calendar-nav-button-left">
              <button
                className="calendar-nav-rounded-button"
                onClick={() => {
                  const newDate = new Date(currentDate);
                  newDate.setDate(currentDate.getDate() - 7);
                  setCurrentDate(newDate);
                }}
              >
                <i className="fa fa-arrow-left" />
              </button>
            </div>

            <span className="calendar-styled-title">
              {weeks[0][0].getMonth() + 1}월 {weeks[0][0].getDate()}일 ~{" "}
              {weeks[0][6].getMonth() + 1}월 {weeks[0][6].getDate()}일
            </span>

            <div className="calendar-nav-button-right">
              <button
                className="calendar-nav-rounded-button"
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
          <div
            className="calendar-tab-background"
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
          />

          <button
            className={`calendar-view-tab ${
              viewMode === "week" ? "active" : ""
            }`}
            onClick={() => {
              setCurrentDate(new Date());
              setViewMode("week");
            }}
          >
            주간 보기
          </button>
          <button
            className={`calendar-view-tab ${
              viewMode === "month" ? "active" : ""
            }`}
            onClick={() => setViewMode("month")}
          >
            월간 보기
          </button>
        </div>
      </div>

      {/* 주간 보기 섹션 (가로 배치: 미니 + 캘린더) */}
      {viewMode === "week" && (
        <div className="calendar-top-section">
          <div className="calendar-mini-month-calendar">
            <div className="calendar-mini-month-header">{currentMonthStr}</div>
            <div className="calendar-mini-weekdays">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                <div key={idx} className="calendar-mini-weekday">
                  {day}
                </div>
              ))}
            </div>
            {groupDatesByWeek(getStartOfMonth(), getEndOfMonth()).map(
              (week, i) => (
                <div key={i} className="calendar-mini-week-row">
{week.map((date, j) => {
  const isInSelectedWeek = weeks[0].some(
    (w) => w.toDateString() === date.toDateString()
  );

  const isToday =
    date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) === todayStr;

  const isSelectedDate =
    date.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" }) ===
    currentDate.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

  // ✅ 일정 존재 여부 확인
  const hasSchedule = filteredSchedules.some(
    (s) =>
      new Date(s.date).toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      }) ===
      date.toLocaleDateString("sv-SE", {
        timeZone: "Asia/Seoul",
      })
  );

  return (
    <div
      key={j}
      className={`calendar-mini-day 
        ${isInSelectedWeek ? "calendar-highlight-week" : ""}
        ${isToday ? "calendar-mini-today" : ""}
        ${isSelectedDate ? "calendar-selected-date" : ""}
        ${hasSchedule ? "calendar-has-schedule" : ""}  // ✅ 추가된 클래스
      `}
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
            <div className="calendar-weekdays">
              {weeks[0].map((date, idx) => (
                <div key={idx}>
                  {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                </div>
              ))}
            </div>

            <div className="calendar-days calendar-view-week">
              {weeks.map((week, i) => (
                <div key={i} className="calendar-week">
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
                        new Date(s.date).toLocaleDateString("sv-SE", {
                          timeZone: "Asia/Seoul",
                        }) ===
                        date.toLocaleDateString("sv-SE", {
                          timeZone: "Asia/Seoul",
                        })
                    );

                    return (
                      <div
                        key={j}
                        className={`calendar-day ${
                          isBaseDate ? "calendar-base-date" : ""
                        }`}
                        onClick={() => setCurrentDate(date)}
                      >
                        <div
                          className={`calendar-day-number ${
                            isToday ? "calendar-today" : ""
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        <div className="calendar-schedule-details">
                          {schedulesForDate.map((s, index) => (
                            <div
                              key={index}
                              className={`calendar-schedule-box calendar-priority-${
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
          <div className="calendar-weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>
          <div className="calendar-days calendar-view-month">
            {weeks.map((week, i) => (
              <div key={i} className="calendar-week">
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
                      new Date(s.date).toLocaleDateString("sv-SE", {
                        timeZone: "Asia/Seoul",
                      }) === localDateStr
                  );

                  return (
                    <div
                      key={j}
                      className="calendar-day"
                      onClick={() => {
                        setCurrentDate(date);
                        setViewMode("week");
                      }}
                    >
                      <div
                        className={`calendar-day-number ${
                          isToday ? "calendar-today" : ""
                        } ${isOtherMonth ? "calendar-other-month" : ""}`}
                      >
                        {date.getDate()}
                      </div>

                      <div className="calendar-schedule-details">
                        {schedulesForDate.map((s, index) => (
                          <div
                            key={index}
                            className={`calendar-schedule-box calendar-priority-${
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
        <div className="calendar-weekly-summary-table-rows">
          {weeks[0].map((date, idx) => {
            const localDateStr = new Date(date).toLocaleDateString("sv-SE", {
              timeZone: "Asia/Seoul",
            });

            const schedules = filteredSchedules.filter(
              (s) =>
                new Date(s.date).toLocaleDateString("sv-SE", {
                  timeZone: "Asia/Seoul",
                }) === localDateStr
            );

            if (window.innerWidth <= 768 && schedules.length === 0) return null;

            return (
              <div key={idx} className="calendar-summary-date-block">
                <div className="calendar-summary-date-column">
                  <div className="calendar-weekday-text">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="calendar-day-number-large">
                    {date.getDate()}
                  </div>
                </div>

                <div className="calendar-summary-schedule-blocks">
                  {schedules.length > 0 ? (
                    schedules.map((s, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && (
                          <hr className="calendar-schedule-divider-hr" />
                        )}
                        <div className="calendar-schedule-card-wide">
                          {/* 시간 + 카테고리 */}


                          {/* 제목 + 펫 */}
                          <div className="calendar-summary-title-pets">
                            <div className="calendar-schedule-title">
                              {s.title}
                            </div>
                            <div className="calendar-schedule-pets">
                              {(s.petInfo || []).map((pet, i) => {
                                const imageSrc = pet.image
                                  ? pet.image.startsWith("http") ||
                                    pet.image.startsWith("data:")
                                    ? pet.image
                                    : `${API_BASE_URL}${pet.image}`
                                  : defaultPetPic;

                                return (
                                  <div
                                    key={i}
                                    className="calendar-pet-circle-with-name"
                                  >
                                    <div className="calendar-pet-circle">
                                      <img
                                        src={imageSrc}
                                        alt={pet.name}
                                        title={pet.name}
                                        className="calendar-schedule-pet-thumbnail"
                                      />
                                    </div>
                                    <span className="calendar-pet-name">
                                      {pet.name}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                                                    <div className="calendar-summary-time-category">
                            <div className="calendar-date-text">
                              <AccessTimeFilledRoundedIcon
                                fontSize="small"
                                className="calendar-summary-icon"
                              />
                              {new Date(s.date).toLocaleDateString("ko-KR", {
                                timeZone: "Asia/Seoul",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="calendar-category-text">
                              <CategoryRoundedIcon
                                fontSize="small"
                                className="calendar-summary-icon"
                              />
                              {s.categoryName || "카테고리 없음"}
                            </div>
                          </div>

                          {/* 중요도 + 상세보기 */}
                          <div className="calendar-summary-actions">
                            <span
                              className={`calendar-priority-badge ${s.priority?.toLowerCase()}`}
                            >
                              {s.priority}
                            </span>
                            <button
                              className="calendar-styled-detail-button"
                              onClick={() => onOpenDetail(s.scheduleId, s.date)}
                            >
                              <span className="calendar-detail-text">
                                상세보기
                              </span>
                              <InfoRoundedIcon
                                className="calendar-styled-detail-icon"
                                fontSize="small"
                              />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  ) : (
                    <div className="calendar-no-schedule">일정 없음</div>
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
