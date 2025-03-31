import { timeAgo } from "../util/time";

describe("timeAgo function", () => {
  test("should return 'Just now' for a date within 1 second", () => {
    expect(timeAgo(new Date())).toBe("Just now");
  });

  test("should return 'X seconds ago' for times under a minute", () => {
    expect(timeAgo(new Date(Date.now() - 15 * 1000))).toBe("15 seconds ago");
  });

  test("should return 'X minutes ago' for times under an hour", () => {
    expect(timeAgo(new Date(Date.now() - 5 * 60 * 1000))).toBe("5 minutes ago");
  });

  test("should return 'X hours ago' for times under a day", () => {
    expect(timeAgo(new Date(Date.now() - 3 * 60 * 60 * 1000))).toBe("3 hours ago");
  });

  test("should return 'X days ago' for times beyond a day", () => {
    expect(timeAgo(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))).toBe("2 days ago");
  });
});