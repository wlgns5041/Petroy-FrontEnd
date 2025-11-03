import React, { useState, useEffect } from "react";
import "../../styles/Main/CalendarComponent.css";
import "font-awesome/css/font-awesome.min.css";
import AccessTimeFilledRoundedIcon from "@mui/icons-material/AccessTimeFilledRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import PetsRoundedIcon from "@mui/icons-material/PetsRounded";
import defaultPetPic from "../../assets/images/DefaultImage.png";

const API_BASE_URL = process.env.REACT_APP_API_URL || "";

// 날짜 포맷 통일 함수
const formatDateKey = (date) =>
  new Date(date).toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

const CalendarComponent = ({ filteredSchedules, onOpenDetail }) => {
  const [viewMode, setViewMode] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tabIndex = viewMode === "week" ? 0 : 1;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = formatDateKey(new Date());

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

  const hasAnySchedulesInWeek = weeks[0].some((date) =>
  filteredSchedules.some((s) => formatDateKey(s.date) === formatDateKey(date))
);

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
          {/* 미니 달력 */}
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
                <div
                  key={week[0].toISOString()}
                  className="calendar-mini-week-row"
                >
                  {week.map((date, j) => {
                    const isInSelectedWeek = weeks[0].some(
                      (w) => w.toDateString() === date.toDateString()
                    );
                    const dateKey = formatDateKey(date);
                    const isToday = dateKey === todayStr;
                    const isSelectedDate =
                      dateKey === formatDateKey(currentDate);

                    const hasSchedule = filteredSchedules.some(
                      (s) => formatDateKey(s.date) === dateKey
                    );

                    return (
                      <div
                        key={date.toISOString()}
                        className={`calendar-mini-day 
                          ${isInSelectedWeek ? "calendar-highlight-week" : ""}
                          ${isToday ? "calendar-mini-today" : ""}
                          ${isSelectedDate ? "calendar-selected-date" : ""}
                          ${hasSchedule ? "calendar-has-schedule" : ""}`}
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
              {weeks[0].map((date) => (
                <div key={date.toISOString()}>
                  {date.toLocaleDateString("ko-KR", { weekday: "short" })}
                </div>
              ))}
            </div>

            <div className="calendar-days calendar-view-week">
              {weeks.map((week) => (
                <div key={week[0].toISOString()} className="calendar-week">
                  {week.map((date) => {
                    const dateKey = formatDateKey(date);
                    const isBaseDate = dateKey === formatDateKey(currentDate);
                    const isToday = dateKey === todayStr;

                    const schedulesForDate = filteredSchedules.filter(
                      (s) => formatDateKey(s.date) === dateKey
                    );

                    return (
                      <div
                        key={date.toISOString()}
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
                          {schedulesForDate.map((s) => (
                            <div
                              key={s.scheduleId}
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

      {/* 월간 보기 */}
      {viewMode === "month" && (
        <>
          <div className="calendar-weekdays">
            {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
              <div key={idx}>{day}</div>
            ))}
          </div>
          <div className="calendar-days calendar-view-month">
            {weeks.map((week) => (
              <div key={week[0].toISOString()} className="calendar-week">
                {week.map((date) => {
                  const dateKey = formatDateKey(date);
                  const isToday = dateKey === todayStr;
                  const isOtherMonth =
                    date.getMonth() !== currentDate.getMonth();

                  const schedulesForDate = filteredSchedules.filter(
                    (s) => formatDateKey(s.date) === dateKey
                  );

                  return (
                    <div
                      key={date.toISOString()}
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
                        {schedulesForDate.map((s) => (
                          <div
                            key={s.scheduleId}
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
      {viewMode === "week" && (!isMobile || hasAnySchedulesInWeek) && (
        <div className="calendar-weekly-summary-table-rows">
          {weeks[0].map((date) => {
            const dateKey = formatDateKey(date);
            const schedules = filteredSchedules.filter(
              (s) => formatDateKey(s.date) === dateKey
            );

            if (isMobile && schedules.length === 0) return null;

            return (
              <div
                key={date.toISOString()}
                className="calendar-summary-date-block"
              >
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
                      <React.Fragment key={s.scheduleId || i}>
                        {i > 0 && (
                          <hr className="calendar-schedule-divider-hr" />
                        )}
                        <div className="calendar-schedule-card-wide">
                          {/* ① 제목 영역 */}
                          <div className="calendar-summary-title">
                            <div className="calendar-schedule-title">
                              {s.title}
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

                            <div className="calendar-pet-text">
                              <PetsRoundedIcon
                                sx={{ fontSize: 14 }}
                                className="calendar-summary-icon"
                              />
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
                                          onError={(e) =>
                                            (e.target.src = defaultPetPic)
                                          }
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
                          </div>

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
