import {
  addLeadingZero,
  filterScheduleByChatAndTag,
  filterScheduleByDay,
  filterScheduleByDayAndTime,
  getAnnounceDutyMessage,
  getDayMonthTime,
  getDutyMessage,
  getNextDayMonth,
  getTimeInMinutes,
  isTimeToNextDay,
} from './utils';
import {
  getSchedule,
  getScheduleResultForAsd,
  getScheduleResultForQa,
  getScheduleResultForWeb,
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
        filterScheduleByChatAndTag(schedule, 2000010050, 'web')
      ).toStrictEqual(getScheduleResultForWeb());

      expect(
        filterScheduleByChatAndTag(schedule, 2000010050, 'qa')
      ).toStrictEqual(getScheduleResultForQa());

      expect(
        filterScheduleByChatAndTag(schedule, 2000010050, null)
      ).toStrictEqual([]);
    });
  });

  describe('filterScheduleByDay', () => {
    const scheduleForWeb = getScheduleResultForWeb();

    it('should be an empty array because no duty on wednesday', () => {
      expect(filterScheduleByDay(scheduleForWeb, 3)).toStrictEqual([]);
    });

    it('should be a duty on monday', () => {
      expect(filterScheduleByDay(scheduleForWeb, 1)).toStrictEqual([
        scheduleForWeb[0],
      ]);
    });
  });

  describe('filterScheduleByDayAndTime', () => {
    const scheduleForWeb = getScheduleResultForWeb();
    const scheduleForAsd = getScheduleResultForAsd();

    it('should be an empty array because no duty on wednesday', () => {
      expect(filterScheduleByDayAndTime(scheduleForWeb, 3, 500)).toStrictEqual(
        []
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
        scheduleForAsd
      );
    });

    it('Should be no duty on monday at 23:46', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1426)).toStrictEqual(
        []
      );
    });

    it('Eugene should be a duty on tuesday at 23:19', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1399)).toStrictEqual(
        scheduleForAsd
      );
    });

    it('Should be no duty on tuesday at 23:20', () => {
      expect(filterScheduleByDayAndTime(scheduleForAsd, 2, 1400)).toStrictEqual(
        []
      );
    });
  });

  describe('getDayMonthTime', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 1, 19, 20, 20));

    const { day, dayNumber, minutes, month, hours } = getDayMonthTime();
    expect(day).toBe(19);
    expect(month).toBe(2);
    expect(dayNumber).toBe(0);
    expect(hours).toBe(20);
    expect(minutes).toBe(20);
  });

  describe('getNextDayMonth', () => {
    describe('Should be next day and same month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 19, 20, 20));

      const { day, month } = getNextDayMonth();
      expect(day).toBe(20);
      expect(month).toBe(2);
    });

    describe('Should be next day and next month', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const { day, month } = getNextDayMonth();
      expect(day).toBe(1);
      expect(month).toBe(3);
    });
  });

  describe('getDutyMessage with mentioning', () => {
    describe('Single schedule without tag and same day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getDutyMessage(schedule)).toBe(
        '@id900033 (ТестДва) с 15:00 28.02 до 22:00 28.02'
      );
    });

    describe('Single schedule without tag and next day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagNextDay();

      expect(getDutyMessage(schedule)).toBe(
        '@id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Single schedule with tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithTag();

      expect(getDutyMessage(schedule)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Sorted schedule', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();
      expect(getDutyMessage(schedule)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03\n#web @id900011 (ТестТри) с 23:45 28.02 до 23:20 01.03\n#web @id900026 (TestOne) с 00:00 28.02 до 23:59 28.02'
      );
    });
  });

  describe('getDutyMessage without mentioning', () => {
    describe('Single schedule without tag and same day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getDutyMessage(schedule, false)).toBe(
        'ТестДва ПримерДва с 15:00 28.02 до 22:00 28.02'
      );
    });

    describe('Single schedule without tag and next day', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithoutTagNextDay();

      expect(getDutyMessage(schedule, false)).toBe(
        'ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Single schedule with tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getSingleScheduleWithTag();

      expect(getDutyMessage(schedule, false)).toBe(
        '#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Sorted schedule', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();
      expect(getDutyMessage(schedule, false)).toBe(
        '#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03\n#web ТестТри ПримерТри с 23:45 28.02 до 23:20 01.03\n#web TestOne ExampleOne с 00:00 28.02 до 23:59 28.02'
      );
    });
  });

  describe('getAnnounceDutyMessage', () => {
    describe('Should be an empty duty message without tag', () => {
      expect(getAnnounceDutyMessage([], null, false)).toBe(
        'Нет дежурств в данное время'
      );

      expect(getAnnounceDutyMessage([], null, true)).toBe(
        'Нет дежурств в данное время'
      );
    });

    describe('Should be an empty duty message with tag', () => {
      expect(getAnnounceDutyMessage([], 'web', false)).toBe(
        '#web Нет дежурств в данное время'
      );

      expect(getAnnounceDutyMessage([], 'web', true)).toBe(
        '#web Нет дежурств в данное время'
      );
    });

    describe('Should be no duties at current time but with next duties message', () => {
      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getAnnounceDutyMessage(schedule, null, true)).toBe(
        'Нет дежурств в данное время\n\nДежурства сегодня:\nТестДва ПримерДва с 15:00 28.02 до 22:00 28.02'
      );
    });

    describe('Should be duties at current time', () => {
      const schedule = getSingleScheduleWithoutTagSameDay();

      expect(getAnnounceDutyMessage(schedule, null, false)).toBe(
        '@id900033 (ТестДва) с 15:00 28.02 до 22:00 28.02'
      );
    });

    describe('Should be no duties at current time but with next duties message and tag', () => {
      const schedule = getSingleScheduleWithTag();

      expect(getAnnounceDutyMessage(schedule, 'web', true)).toBe(
        '#web Нет дежурств в данное время\n\nДежурства сегодня:\n#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Should be duties at current time with tag', () => {
      const schedule = getSingleScheduleWithTag();

      expect(getAnnounceDutyMessage(schedule, 'web', false)).toBe(
        '#web @id900033 (ТестДва) с 22:00 28.02 до 15:00 01.03'
      );
    });

    describe('Should be no duties at current time but with multiple next duties message and tag', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2023, 1, 28, 20, 20));

      const schedule = getUnsortedSchedule();

      expect(getAnnounceDutyMessage(schedule, 'web', true)).toBe(
        '#web Нет дежурств в данное время\n\nДежурства сегодня:\n#web TestOne ExampleOne с 00:00 28.02 до 23:59 28.02\n#web ТестДва ПримерДва с 22:00 28.02 до 15:00 01.03\n#web ТестТри ПримерТри с 23:45 28.02 до 23:20 01.03'
      );
    });
  });
});
