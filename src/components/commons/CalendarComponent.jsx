import React, { useState } from 'react';
import '../../styles/CalendarComponent.css';
import 'font-awesome/css/font-awesome.min.css';

const CalendarComponent = ({ filteredSchedules }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(1 - firstDayOfMonth.getDay());

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const endDay = new Date(lastDayOfMonth);
    endDay.setDate(lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()));

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

    const weeks = groupDatesByWeek(startDay, endDay);
    
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="nav-button">
                    <i className="fa fa-chevron-left" />
                </button>
                <h2>{year}년 {month + 1}월</h2>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="nav-button">
                    <i className="fa fa-chevron-right" />
                </button>
            </div>

            <div className="weekdays">
                <div>일</div><div>월</div><div>화</div><div>수</div><div>목</div><div>금</div><div>토</div>
            </div>

            <div className="days">
                {weeks.map((week, i) => (
                    <div key={i} className="week">
                        {week.map((date, j) => {
                            const localDateStr = new Date(date).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });
                            const isToday = localDateStr === todayStr;

                            const schedulesForDate = filteredSchedules.filter(
                                s => new Date(s.date).toISOString().split('T')[0] === localDateStr
                            );

                            return (
                                <div key={j} className={`day ${isToday ? 'today' : ''}`}>
                                    <div className="day-number">{date.getDate()}</div>
                                    <div className="schedule-details">
                                        {schedulesForDate.map((s, index) => (
                                            <div key={index} className={`schedule-box priority-${s.priority?.toLowerCase() || 'normal'}`}>
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
    );
};

export default CalendarComponent;