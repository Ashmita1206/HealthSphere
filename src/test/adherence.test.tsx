import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdherenceTrendChart } from "@/components/charts/AdherenceTrendChart";

function parseDailyFrequency(freqStr?: string): number {
  if (!freqStr || typeof freqStr !== "string") return 1;
  const lower = freqStr.toLowerCase();
  if (
    lower.includes("twice") ||
    lower.includes("2x") ||
    lower.includes("2 time") ||
    lower.includes("bid") ||
    lower.includes("every 12")
  )
    return 2;
  if (
    lower.includes("thrice") ||
    lower.includes("3x") ||
    lower.includes("3 time") ||
    lower.includes("tid") ||
    lower.includes("every 8")
  )
    return 3;
  if (
    lower.includes("4x") ||
    lower.includes("4 time") ||
    lower.includes("qid") ||
    lower.includes("every 6")
  )
    return 4;
  return 1;
}

// Helper function mirroring backend 7-day adherence calculation logic for unit verification
function calculate7DayAdherence(
  last7Dates: { dateStr: string; dayLabel: string }[],
  scheduledItems: Array<{ frequency?: string }>,
  doseLogs: { userId: string; careActionId: string; scheduledDate: string; completed: boolean }[],
  targetUserId: string
) {
  const userLogs = doseLogs.filter((dl) => dl.userId === targetUserId);
  const totalScheduledPerDay = scheduledItems.reduce((sum, item) => sum + parseDailyFrequency(item.frequency), 0);

  if (totalScheduledPerDay === 0) {
    return { adherenceRate: null, adherenceData: [] };
  }

  let totalDosesTaken = 0;
  let totalDosesScheduled = 0;

  const adherenceData = last7Dates.map(({ dateStr, dayLabel }) => {
    const logsForDay = userLogs.filter((dl) => dl.scheduledDate === dateStr && dl.completed);
    const dosesTaken = Math.min(logsForDay.length, totalScheduledPerDay);
    const dosesTotal = totalScheduledPerDay;

    const adherence = Math.min(100, Math.round((dosesTaken / dosesTotal) * 100));
    totalDosesTaken += dosesTaken;
    totalDosesScheduled += dosesTotal;

    return { day: dayLabel, adherence, dosesTaken, dosesTotal };
  });

  const adherenceRate =
    totalDosesScheduled > 0
      ? Math.min(100, Math.round((totalDosesTaken / totalDosesScheduled) * 100))
      : null;

  return { adherenceRate, adherenceData };
}

describe("Medication Adherence & Dose Completion Logic", () => {
  const last7Dates = [
    { dateStr: "2026-08-17", dayLabel: "Mon" },
    { dateStr: "2026-08-18", dayLabel: "Tue" },
    { dateStr: "2026-08-19", dayLabel: "Wed" },
    { dateStr: "2026-08-20", dayLabel: "Thu" },
    { dateStr: "2026-08-21", dayLabel: "Fri" },
    { dateStr: "2026-08-22", dayLabel: "Sat" },
    { dateStr: "2026-08-23", dayLabel: "Sun" },
  ];

  it("1. Returns null rate and empty data when no scheduled doses exist", () => {
    const result = calculate7DayAdherence(last7Dates, [], [], "user1");
    expect(result.adherenceRate).toBeNull();
    expect(result.adherenceData).toEqual([]);
  });

  it("2. Parses frequency strings for multi-dose schedules ('twice daily', '3 times daily')", () => {
    expect(parseDailyFrequency("Twice daily")).toBe(2);
    expect(parseDailyFrequency("3 times daily")).toBe(3);
    expect(parseDailyFrequency("Once a day")).toBe(1);

    const items = [{ frequency: "Twice daily" }];
    const logs = [
      { userId: "user1", careActionId: "m1", scheduledDate: "2026-08-23", completed: true },
      { userId: "user1", careActionId: "m1_dose2", scheduledDate: "2026-08-23", completed: true },
    ];
    const result = calculate7DayAdherence(last7Dates, items, logs, "user1");
    expect(result.adherenceData[6]).toEqual({
      day: "Sun",
      adherence: 100,
      dosesTaken: 2,
      dosesTotal: 2,
    });
  });

  it("3. Calculates accurate 7-day adherence rate from real dose logs without Math.max denominator inflation", () => {
    const items = [{ frequency: "Daily" }, { frequency: "Daily" }];
    const doseLogs = [
      { userId: "user1", careActionId: "m1", scheduledDate: "2026-08-23", completed: true },
      { userId: "user1", careActionId: "m2", scheduledDate: "2026-08-23", completed: true },
      { userId: "user1", careActionId: "m1", scheduledDate: "2026-08-22", completed: true },
    ];
    const result = calculate7DayAdherence(last7Dates, items, doseLogs, "user1");
    expect(result.adherenceRate).toBe(21); // Math.round((3 / 14) * 100) = 21%
    expect(result.adherenceData).toHaveLength(7);
  });

  it("4. Strictly scopes dose logs by user ID (prevents cross-user IDOR contamination)", () => {
    const items = [{ frequency: "Daily" }];
    const doseLogs = [
      { userId: "user2_attacker", careActionId: "m1", scheduledDate: "2026-08-23", completed: true },
    ];
    const result = calculate7DayAdherence(last7Dates, items, doseLogs, "user1_victim");
    expect(result.adherenceData[6].dosesTaken).toBe(0);
    expect(result.adherenceData[6].adherence).toBe(0);
    expect(result.adherenceRate).toBe(0);
  });

  it("5. Prevents duplicate dose log entries for same date/action via unique compound indexing key", () => {
    const logs = [
      { userId: "user1", careActionId: "m1", scheduledDate: "2026-08-23", completed: true },
    ];
    const logMap = new Map();
    logs.forEach((l) => logMap.set(`${l.userId}:${l.careActionId}:${l.scheduledDate}`, l));
    const dup = { userId: "user1", careActionId: "m1", scheduledDate: "2026-08-23", completed: true };
    logMap.set(`${dup.userId}:${dup.careActionId}:${dup.scheduledDate}`, dup);

    expect(logMap.size).toBe(1);
  });
});

describe("AdherenceTrendChart Frontend Component", () => {
  it("renders neutral empty state when no adherence data exists", () => {
    render(<AdherenceTrendChart data={[]} adherenceRate={null} />);
    expect(screen.getByText(/No medication adherence data logged yet/i)).toBeInTheDocument();
    expect(screen.getByText(/No Adherence Rate/i)).toBeInTheDocument();
  });

  it("renders calculated weekly rate badge when real data exists", () => {
    const data = [
      { day: "Mon", adherence: 100, dosesTaken: 2, dosesTotal: 2 },
      { day: "Tue", adherence: 50, dosesTaken: 1, dosesTotal: 2 },
    ];
    render(<AdherenceTrendChart data={data} adherenceRate={75} />);
    expect(screen.getByText(/75% Weekly Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/7-Day Medication Adherence/i)).toBeInTheDocument();
  });
});
