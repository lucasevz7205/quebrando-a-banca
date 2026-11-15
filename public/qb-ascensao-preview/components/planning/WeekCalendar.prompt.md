Weekly plan grid (calendar ≠ cycle: the cycle is a subject SEQUENCE, see CycleConfigurator).

```jsx
<WeekCalendar days={week} today="2026-11-14" selectedDate={sel} onSelectDay={setSel}
  weekLabel="8 a 14 de novembro" onPrevWeek={prev} onNextWeek={next} onToday={reset} isCurrentWeek={offset === 0}
  previews={preview ? preview.labels : {}} onSelectTask={openTask} />
```
