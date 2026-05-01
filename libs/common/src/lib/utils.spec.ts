import {
  addLeadingZero,
  filterScheduleByChatAndTag,
  filterScheduleByDay,
  filterScheduleByDayAndTime,
  getAnnounceDutyMessage,
  getDayMonthTime,
  getDaysArray,
  getDaysRange,
  getDutyMessage,
  getNextDayMonth,
  getTimeInMinutes,
  isTimeToNextDay,
  shouldCallCron,
} from './utils';
import {
  getSchedule,
  getScheduleResultForAsd,
  getScheduleResultForQa,
  getScheduleResultForWeb,
  getScheduleWithDifferentTime,
  getSingleScheduleWithoutTagNextDay,
  getSingleScheduleWithoutTagSameDay,
  getSingleScheduleWithTag,
  getUnsortedSchedule,
} from './utils.mock';

describe('utils testing', () => {
  describe('addLeadingZero', () => {
    it('should add leading zero to a number', () => {
      const number = 1;

      expect(addLeadingZero(number)).toBe('01');
    });

    it('should not add leading zero to a which bigger than 10', () => {
      const number = 12;

      expect(addLeadingZero(number)).toBe('12');
    });
  });

  describe('getTimeInMinutes', () => {
    it('should correctly calculate time in minutes from string', () => {
      const time0 = '00:00';
      const time20 = '00:20';
      const time1439 = '23:59';

      expect(getTimeInMinutes(time0)).toBe(0);
      expect(getTimeInMinutes(time20)).toBe(20);
      expect(getTimeInMinutes(time1439)).toBe(1439);
    });
  });

  describe('isTimeToNextDay', () => {
    it('should correctly determine if time ends on next day', () => {
      let timeFrom = '00:12';
      let timeTo = '00:11';
      expect(isTimeToNextDay(timeFrom, timeTo)).toBe(true);

      timeFrom = '01:10';
      timeTo = '02:10';
      expect(isTimeToNextDay(timeFrom, timeTo)).toBe(false);

      timeFrom = '00:00';
      timeTo = '23:59';
      expect(isTimeToNextDay(timeFrom, timeTo)).toBe(false);
    });
  });

  describe('filterScheduleByChatAndTag', () => {
    it('should correctly filter schedule by chat and tag', () => {
      const schedule = getSchedule();

      expect(
        filterScheduleByChatAndTag(schedule, 2000010050, 'web'),
      ).toStrictEqual(getScheduleResultForWeb());

      expect(
        filterScheduleByChatAndTag(schedule, 2000010050, 'qa'),
      ).toStrictEqual(getScheduleResultForQa());

      expect(
        filterScheduleByChatAndTag(schedule, 2000010050, null),
      ).toStrictEqual([]);
    });
  });

  describe('filterScheduleByDay', () => {
    const schedule = getScheduleWithDifferentTime();
    const scheduleNextDay = getUnsortedSchedule();

    it('should be an empty array because no duty on tuesday', () => {
      expect(filterScheduleByDay(schedule, 2, 50)).toStrictEqual([]);
    });

    it('should be duties on monday', () => {
      expect(filterScheduleByDay(schedule, 1, 840)).toStrictEqual(schedule);
    });

    it('should be a duty on monday only after 22:00', () => {
      expect(filterScheduleByDay(schedule, 1, 1330)).toStrictEqual([
        schedule[1],
      ]);
    });

    it('should be no duty on monday after 23:45', () => {
      expect(filterScheduleByDay(schedule, 1, 1426)).toStrictEqual([]);
    });

    it('should be duties on monday after 23:45', () => {
      expect(filterScheduleByDay(scheduleNextDay, 1, 1426)).toStrictEqual(
        scheduleNextDay,
      );
    });
  });

  describe('filterScheduleByDayAndTime', () => {
    const scheduleForWeb = getScheduleResultForWeb();
    const scheduleForAsd = getScheduleResultForAsd();

    it('should be an empty array because no duty on wednesday', () => {
      expect(filterScheduleByDayAndTime(scheduleForWeb, 3, 500)).toStrictEqual(
        [],
      );
    });

    it('TestOne should be a duty on monday', () => {
      expect(filterScheduleByDayAndTime(scheduleForWeb, 1, 510)).toStrictEqual([
        scheduleForWeb[0],
      ]);
    });

    it('TestOne should be a duty on tuesday', () => {
      expect(filterScheduleByDayAndTime(scheduleForWeb, 2, 510)).toStrictEqual([
        scheduleForWeb[1],
      ]);
    });

    it('Eugene should be a duty on monday at 23:46', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 1, 1426)).toStrictEqual(
        scheduleForAsd,
      );
    });

    it('Should be no duty on monday at 23:46', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1426)).toStrictEqual(
        [],
      );
    });

    it('Eugene should be a duty on tuesday at 23:19', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1399)).toStrictEqual(
        scheduleForAsd,
      );
    });

    it('Should be no duty on tuesday at 23:20', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1400)).toStrictEqual(
        [],
      );
    });
  });

  describe('getDayMonthTime', () => {
    it('should return correct day, month, dayNumber, hours, minutes', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 19, 20, 20));

      const { day, dayNumber, minutes, month, hours } = getDayMonthTime();
      expect(day).toBe(19);
      expect(month).toBe(2);
      expect(dayNumber).toBe(0);
      expect(hours).toBe(20);
      expect(minutes).toBe(20);
    });
  });

  describe('getNextDayMonth', () => {
    it('Should be next day and same month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 19, 20, 20));

      const { day, month } = getNextDayMonth();
      expect(day).toBe(20);
      expect(month).toBe(2);
    });

    it('Should be next day and next month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const { day, month } = getNextDayMonth();
      expect(day).toBe(1);
      expect(month).toBe(3);
    });
  });

  describe('getDutyMessage with mentioning', () => {
    it('Single schedule without tag and same day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getDutyMessage(schedule)).toBe(
        '@id900033 (ТестДва) с 15:00 28.02 до 22:00 28.02',
      );
    });

    it('Single schedule without tag and next day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagNextDay();

      expect(getDutyMessage(schedule)).toBe(
        '@id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Single schedule with tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithTag();

      expect(getDutyMessage(schedule)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Sorted schedule', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();
      expect(getDutyMessage(schedule)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03\n#web @id900011 (ТестТри) с 23:45 28.02 до 23:20 01.03\n#web @id900026 (TestOne) с 00:00 28.02 до 23:59 28.02',
      );
    });
  });

  describe('getDutyMessage without mentioning', () => {
    it('Single schedule without tag and same day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getDutyMessage(schedule, false)).toBe(
        'ТестДва ПримерДва с 15:00 28.02 до 22:00 28.02',
      );
    });

    it('Single schedule without tag and next day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagNextDay();

      expect(getDutyMessage(schedule, false)).toBe(
        'ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Single schedule with tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithTag();

      expect(getDutyMessage(schedule, false)).toBe(
        '#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Sorted schedule', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();
      expect(getDutyMessage(schedule, false)).toBe(
        '#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03\n#web ТестТри ПримерТри с 23:45 28.02 до 23:20 01.03\n#web TestOne ExampleOne с 00:00 28.02 до 23:59 28.02',
      );
    });
  });

  describe('getAnnounceDutyMessage', () => {
    it('Should be an empty duty message without tag', () => {
      expect(getAnnounceDutyMessage([], null, false)).toBe(
        'Нет дежурств в данное время',
      );

      expect(getAnnounceDutyMessage([], null, true)).toBe(
        'Нет дежурств в данное время',
      );
    });

    it('Should be an empty duty message with tag', () => {
      expect(getAnnounceDutyMessage([], 'web', false)).toBe(
        '#web Нет дежурств в данное время',
      );

      expect(getAnnounceDutyMessage([], 'web', true)).toBe(
        '#web Нет дежурств в данное время',
      );
    });

    it('Should be no duties at current time but with next duties message', () => {
      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getAnnounceDutyMessage(schedule, null, true)).toBe(
        'Нет дежурств в данное время\n\nДежурства сегодня:\nТестДва ПримерДва с 15:00 28.02 до 22:00 28.02',
      );
    });

    it('Should be duties at current time', () => {
      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getAnnounceDutyMessage(schedule, null, false)).toBe(
        '@id900033 (ТестДва) с 15:00 28.02 до 22:00 28.02',
      );
    });

    it('Should be no duties at current time but with next duties message and tag', () => {
      const schedule = getSingleScheduleWithTag();

      expect(getAnnounceDutyMessage(schedule, 'web', true)).toBe(
        '#web Нет дежурств в данное время\n\nДежурства сегодня:\n#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Should be duties at current time with tag', () => {
      const schedule = getSingleScheduleWithTag();

      expect(getAnnounceDutyMessage(schedule, 'web', false)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03',
      );
    });

    it('Should be no duties at current time but with multiple next duties message and tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();

      expect(getAnnounceDutyMessage(schedule, 'web', true)).toBe(
        '#web Нет дежурств в данное время\n\nДежурства сегодня:\n#web TestOne ExampleOne с 00:00 28.02 до 23:59 28.02\n#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03\n#web ТестТри ПримерТри с 23:45 28.02 до 23:20 01.03',
      );
    });
  });

  describe('getDaysRange', () => {
    it('should format day ranges correctly', () => {
      expect(getDaysRange([1, 2, 3])).toBe('1-3');
      expect(getDaysRange([1, 3])).toBe('1,3');
      expect(getDaysRange([1, 2, 4])).toBe('1,2,4');
      expect(getDaysRange([1, 2, 3, 4, 5])).toBe('1-5');
      expect(getDaysRange([1, 2, 4, 5])).toBe('1,2,4,5');
      expect(getDaysRange([1, 2, 3, 5])).toBe('1-3,5');
      expect(getDaysRange([1, 2, 4, 5, 6])).toBe('1,2,4-6');
    });
  });

  describe('getDaysArray', () => {
    it('should parse day range strings correctly', () => {
      expect(getDaysArray('1-3')).toStrictEqual([1, 2, 3]);
      expect(getDaysArray('1,3')).toStrictEqual([1, 3]);
      expect(getDaysArray('1,2,4')).toStrictEqual([1, 2, 4]);
      expect(getDaysArray('1-5')).toStrictEqual([1, 2, 3, 4, 5]);
      expect(getDaysArray('1,2,4,5')).toStrictEqual([1, 2, 4, 5]);
      expect(getDaysArray('1-3,5')).toStrictEqual([1, 2, 3, 5]);
      expect(getDaysArray('1,2,4-6')).toStrictEqual([1, 2, 4, 5, 6]);
    });
  });

  describe('shouldCallCron', () => {
    // Helper: builds a UTC midnight timestamp for Moscow (UTC+3) for a given date
    // All dates are Moscow midnight = UTC midnight - 3h = date at 21:00 previous UTC day
    // We use Date.UTC for clarity; tests mirror the real usage (Moscow midnight timestamps)

    describe('repeat=0 — каждую неделю (every week)', () => {
      it('should always return true regardless of date distance', () => {
        // Same day
        expect(shouldCallCron(1704834000000, 1704834000000, 0)).toBe(true);
        // 1 week later
        expect(shouldCallCron(1704834000000, 1705438800000, 0)).toBe(true);
        // 1 month later
        expect(shouldCallCron(1704834000000, 1707426000000, 0)).toBe(true);
        // 6 months later
        expect(shouldCallCron(1704834000000, 1720386000000, 0)).toBe(true);
        // 1 year later
        expect(shouldCallCron(1704834000000, 1736370000000, 0)).toBe(true);
        // Different month boundary
        expect(shouldCallCron(1727643600000, 1727730000000, 0)).toBe(true); // 09.30 vs 10.01
      });
    });

    describe('repeat=1 — раз в месяц (once a month, same week-of-month)', () => {
      it('should return false when start and current are in different weeks of month', () => {
        // Jan 10 (week 2 of Jan) vs Jan 24 (week 4 of Jan)
        expect(shouldCallCron(1704834000000, 1706043600000, 1)).toBe(false);
        // Sep 30 (week 6 of Sep) vs Oct 29 (week 5 of Oct)
        expect(shouldCallCron(1727643600000, 1730149200000, 1)).toBe(false);
      });

      it('should return true when start and current are in the same week-of-month', () => {
        // Same week (isSameWeek → always true)
        expect(shouldCallCron(1727643600000, 1727730000000, 1)).toBe(true); // 09.30 vs 10.01 (same ISO week)
        // Jan 9 (week 2 of Jan) vs Feb 5 (week 2 of Feb)
        expect(shouldCallCron(1704747600000, 1707080400000, 1)).toBe(true);
        // Jan 9 vs Sep 6 (both in week 2 of their respective months)
        expect(shouldCallCron(1704747600000, 1725570000000, 1)).toBe(true);
      });

      it('should return true for same day (isSameWeek)', () => {
        expect(shouldCallCron(1704747600000, 1704747600000, 1)).toBe(true);
      });
    });

    describe('repeat=2 — через неделю (every 2 weeks, even weeksDiff)', () => {
      // Start: Jan 10, 2024 (Wednesday), week of Jan 8–14

      it('should return true for same week (isSameWeek override)', () => {
        // Jan 10 vs Jan 11 — same ISO week
        expect(shouldCallCron(1704834000000, 1704920400000, 2)).toBe(true);
        // Same day
        expect(shouldCallCron(1704747600000, 1704747600000, 2)).toBe(true);
      });

      it('should return true for dates exactly 2 weeks apart (weeksDiff=2)', () => {
        // Jan 10 vs Jan 22 (2 weeks) → weeksDiff=2 → TRUE
        expect(shouldCallCron(1704834000000, 1705870800000, 2)).toBe(true);
        // Jan 10 vs Jan 24 (within same week as Jan 22) → weeksDiff=2 → TRUE
        expect(shouldCallCron(1704834000000, 1706043600000, 2)).toBe(true);
        // Jan 10 vs Jan 26 (weeksDiff=2) → TRUE
        expect(shouldCallCron(1704834000000, 1706216400000, 2)).toBe(true);
      });

      it('should return true for dates 4 weeks apart (weeksDiff=4)', () => {
        // Jan 10 vs Feb 6 (4 weeks)
        expect(shouldCallCron(1704834000000, 1707166800000, 2)).toBe(true);
      });

      it('should return true for dates 6 weeks apart (weeksDiff=6)', () => {
        // Jan 10 vs Feb 19 (6 weeks)
        expect(shouldCallCron(1704834000000, 1708290000000, 2)).toBe(true);
      });

      it('should return true when crossing a month boundary on an even week gap', () => {
        // This was the core bug: week-of-month logic broke at month boundaries
        // Jan 10 (week 2 of Jan) → Apr 1 is week 1 of April, but 12 weeks later → TRUE
        expect(shouldCallCron(1704834000000, 1711926000000, 2)).toBe(true);
        // Sep 30 vs Oct 14 (2 weeks, month boundary) → TRUE
        expect(shouldCallCron(1727643600000, 1728853200000, 2)).toBe(true);
      });

      it('should return true for even weeksDiff far in the future', () => {
        // Jan 10 vs Nov 27, 2024: 46 weeks apart (even) → TRUE
        // (was FALSE in buggy code because week 5 of Nov ∉ evenWeeks)
        expect(shouldCallCron(1704834000000, 1732654800000, 2)).toBe(true);
      });

      it('should return false for dates 1 week apart (weeksDiff=1)', () => {
        // Jan 10 vs Jan 15 (1 week)
        expect(shouldCallCron(1704834000000, 1705266000000, 2)).toBe(false);
      });

      it('should return false for dates on the next week (weeksDiff=1)', () => {
        // Jan 10 vs Jan 19 (next week)
        expect(shouldCallCron(1704834000000, 1705611600000, 2)).toBe(false);
      });

      it('should return false for dates 3 weeks apart (weeksDiff=3)', () => {
        // Jan 10 vs Jan 30 (3 weeks)
        expect(shouldCallCron(1704834000000, 1706562000000, 2)).toBe(false);
      });

      it('should return false for dates 5 weeks apart (weeksDiff=5)', () => {
        // Jan 10 vs Feb 15 (5 weeks)
        expect(shouldCallCron(1704834000000, 1707944400000, 2)).toBe(false);
      });

      it('should return false for dates 7 weeks apart (weeksDiff=7)', () => {
        // Jan 10 vs Mar 1 (7 weeks)
        expect(shouldCallCron(1704834000000, 1709240400000, 2)).toBe(false);
      });

      it('should return false for odd weeksDiff far in the future', () => {
        // Jan 10 vs Nov 21, 2024: 45 weeks apart (odd) → FALSE
        // (was TRUE in buggy code because week 4 of Nov ∈ evenWeeks)
        expect(shouldCallCron(1704834000000, 1732136400000, 2)).toBe(false);
      });

      it('should work correctly with reversed dates (currentDate before startDate)', () => {
        // Sep 30 vs Oct 1 — same ISO week → TRUE
        expect(shouldCallCron(1727730000000, 1727643600000, 2)).toBe(true);
        // Oct 14 vs Sep 30 — 2 weeks reversed → weeksDiff=2 → TRUE
        expect(shouldCallCron(1728853200000, 1727643600000, 2)).toBe(true);
      });

      it('should handle month boundaries where week-of-month resets', () => {
        // Feb 19 (week 4 of Feb) → Mar 4 (week 2 of Mar): 2 calendar weeks apart → TRUE
        expect(shouldCallCron(1708290000000, 1709499600000, 2)).toBe(true);
        // Feb 19 → Mar 11 (week 3 of Mar): 3 calendar weeks → FALSE
        expect(shouldCallCron(1708290000000, 1710108000000, 2)).toBe(false);
        // Feb 19 → Mar 18 (week 4 of Mar): 4 calendar weeks → TRUE
        expect(shouldCallCron(1708290000000, 1710712800000, 2)).toBe(true);
      });
    });

    describe('repeat=3 — через две недели (every 3 weeks, weeksDiff % 3 === 0)', () => {
      // Start: Jan 10, 2024 (Wednesday), week of Jan 8–14

      it('should return true for same week (isSameWeek override)', () => {
        expect(shouldCallCron(1704834000000, 1704920400000, 3)).toBe(true);
        expect(shouldCallCron(1704747600000, 1704747600000, 3)).toBe(true);
      });

      it('should return true for dates 3 weeks apart (weeksDiff=3)', () => {
        // Jan 10 vs Jan 30 (3 weeks) → weeksDiff=3 → 3 % 3 === 0 → TRUE
        expect(shouldCallCron(1704834000000, 1706562000000, 3)).toBe(true);
        // Jan 10 vs Feb 1 (same week as Jan 30, weeksDiff=3) → TRUE
        expect(shouldCallCron(1704834000000, 1706734800000, 3)).toBe(true);
      });

      it('should return true for dates 6 weeks apart (weeksDiff=6)', () => {
        // Jan 10 vs Feb 19 (6 weeks)
        expect(shouldCallCron(1704834000000, 1708290000000, 3)).toBe(true);
      });

      it('should return true for dates 9 weeks apart crossing month boundary (weeksDiff=9)', () => {
        // Jan 10 vs Mar 11 (9 weeks) — this IS a month boundary crossing → TRUE
        // (the old algorithm was inconsistent here)
        expect(shouldCallCron(1704834000000, 1710108000000, 3)).toBe(true);
      });

      it('should return true for dates 12 weeks apart (weeksDiff=12)', () => {
        // Jan 10 vs Apr 1 (12 weeks)
        expect(shouldCallCron(1704834000000, 1711926000000, 3)).toBe(true);
      });

      it('should return true for dates 15 weeks apart (weeksDiff=15)', () => {
        // Jan 10 vs Apr 22 (15 weeks)
        expect(shouldCallCron(1704834000000, 1713740400000, 3)).toBe(true);
      });

      it('should return false for dates 2 weeks apart (weeksDiff=2)', () => {
        // Jan 10 vs Jan 24 (2 weeks)
        expect(shouldCallCron(1704834000000, 1706043600000, 3)).toBe(false);
      });

      it('should return false for dates 4 weeks apart (weeksDiff=4)', () => {
        // Jan 10 vs Feb 6 (4 weeks)
        expect(shouldCallCron(1704834000000, 1707166800000, 3)).toBe(false);
      });

      it('should return false for dates 5 weeks apart (weeksDiff=5)', () => {
        // Jan 10 vs Feb 12 (5 weeks)
        expect(shouldCallCron(1704834000000, 1707685200000, 3)).toBe(false);
      });

      it('should return false for dates 7 weeks apart (weeksDiff=7)', () => {
        // Jan 10 vs Feb 26 (7 weeks)
        expect(shouldCallCron(1704834000000, 1709067600000, 3)).toBe(false);
      });

      it('should return false for dates 8 weeks apart (weeksDiff=8)', () => {
        // Jan 10 vs Mar 4 (8 weeks) — was TRUE in buggy code
        expect(shouldCallCron(1704834000000, 1709499600000, 3)).toBe(false);
      });

      it('should return false for dates 10 weeks apart (weeksDiff=10)', () => {
        // Jan 10 vs Mar 19 (10 weeks)
        expect(shouldCallCron(1704834000000, 1710799200000, 3)).toBe(false);
      });

      it('should return false for dates 11 weeks apart (weeksDiff=11)', () => {
        // Jan 10 vs Mar 26 (11 weeks)
        expect(shouldCallCron(1704834000000, 1711404000000, 3)).toBe(false);
      });

      it('should return false for dates 13 weeks apart (weeksDiff=13)', () => {
        // Jan 10 vs Apr 8 (13 weeks)
        expect(shouldCallCron(1704834000000, 1712527200000, 3)).toBe(false);
      });

      it('should return false for dates 14 weeks apart (weeksDiff=14)', () => {
        // Jan 10 vs Apr 15 (14 weeks) — was TRUE in buggy code
        expect(shouldCallCron(1704834000000, 1713132000000, 3)).toBe(false);
      });

      it('should handle month-boundary repeats that the old formula got wrong', () => {
        // Feb 29 (7 weeks from Jan 10) → FALSE
        expect(shouldCallCron(1704834000000, 1709154000000, 3)).toBe(false);
        // Mar 1 (same week as Feb 29, weeksDiff=7) → FALSE
        expect(shouldCallCron(1704834000000, 1709240400000, 3)).toBe(false);
      });
    });
  });
});
