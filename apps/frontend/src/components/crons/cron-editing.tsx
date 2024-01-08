import { capitalize, ICrons, IKeyboard } from '@vera-reforged/common';
import {
  Icon20AddCircleOutline,
  Icon20RemoveCircleOutline,
  Icon24Add,
} from '@vkontakte/icons';
import {
  Avatar,
  Button,
  Checkbox,
  DateInput,
  FormItem,
  Text,
  Textarea,
} from '@vkontakte/vkui';

import {
  Dispatch,
  FC,
  Fragment,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
} from 'react';

import format from 'date-fns/format';

import { LinkButtonCreation } from '../link-button-creation';
import { TimePicker } from '../time-picker';

const daysNames: ICrons.Day[] = [
  {
    shortName: 'пн',
    name: 'понедельник',
    nameWhen: 'понедельник',
    dayNumber: 1,
  },
  {
    shortName: 'вт',
    name: 'вторник',
    nameWhen: 'вторник',
    dayNumber: 2,
  },
  {
    shortName: 'ср',
    name: 'среда',
    nameWhen: 'среду',
    dayNumber: 3,
  },
  {
    shortName: 'чт',
    name: 'четверг',
    nameWhen: 'четверг',
    dayNumber: 4,
  },
  {
    shortName: 'пт',
    name: 'пятница',
    nameWhen: 'пятницу',
    dayNumber: 5,
  },
];

const repeatText = [
  {
    name: 'каждую неделю',
    description: 'Повторы производятся каждую неделю в выбранные дни',
  },
  {
    name: 'раз в месяц',
    description:
      'Повторы производятся начиная с недели, включающей выбранную дату начала, и продолжаются раз в месяц в выбранную неделю месяца',
  },
  {
    name: 'через неделю',
    description:
      'Повторы производятся с недели, включающей дату начала, и затем продолжаются через одну неделю: Если в месяце 4 недели и выбранная дата начала в первой неделе, то вызов кронов будет выглядеть следующим образом: ВЫЗОВ-пропуск-ВЫЗОВ-пропуск',
  },
  {
    name: 'через две недели',
    description:
      'Повторы производятся с недели, включающей дату начала, и затем продолжаются через две недели: Если в месяце 4 недели и выбранная дата начала в первой неделе, то вызов кронов будет выглядеть следующим образом: ВЫЗОВ-пропуск-пропуск-ВЫЗОВ',
  },
];

type Props = {
  time: string;
  setTime: Dispatch<SetStateAction<string>>;
  message: string;
  setMessage: Dispatch<SetStateAction<string>>;
  days: number[];
  setDays: Dispatch<SetStateAction<number[]>>;
  button?: IKeyboard.LinkButton;
  setButton: Dispatch<SetStateAction<IKeyboard.LinkButton | undefined>>;
  startDate: number;
  setStartDate: Dispatch<SetStateAction<number>>;
  repeat: number;
  setRepeat: Dispatch<SetStateAction<number>>;

  chatTitle: ReactNode;
  isCreation?: boolean;
};

export const CronEditing: FC<Props> = ({
  time,
  setTime,
  message,
  setMessage,
  days,
  setDays,
  button,
  setButton,
  startDate,
  setStartDate,
  repeat,
  setRepeat,
  chatTitle,
  isCreation = false,
}) => {
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <FormItem top="Время">
          <TimePicker
            value={time}
            onChange={(value) => {
              setTime(value as string);
            }}
          />
        </FormItem>
        <FormItem top="Дни недели">
          <div style={{ display: 'flex', gap: '10px' }}>
            {daysNames.map(({ dayNumber, shortName }) => (
              <Avatar
                key={dayNumber}
                initials={shortName}
                size={40}
                gradientColor={days.includes(dayNumber) ? 'blue' : undefined}
                onClick={() =>
                  setDays((prev) => {
                    if (prev.includes(dayNumber)) {
                      return prev.filter((id) => id !== dayNumber);
                    } else {
                      return [...prev, dayNumber].sort();
                    }
                  })
                }
              >
                <Avatar.Overlay theme="dark">
                  {days.includes(dayNumber) ? (
                    <Icon20RemoveCircleOutline />
                  ) : (
                    <Icon20AddCircleOutline />
                  )}
                </Avatar.Overlay>
              </Avatar>
            ))}
          </div>
        </FormItem>
      </div>

      <FormItem top="Повтор">
        {repeatText.map(({ name, description }, idx) => (
          <Checkbox
            key={idx}
            checked={repeat === idx}
            description={isCreation ? description : undefined}
            title={description}
            onChange={() => {
              setRepeat(idx);
            }}
          >
            {capitalize(name)}
          </Checkbox>
        ))}
      </FormItem>

      <FormItem
        top="Начиная с"
        bottom="День и неделя, с которых начинать повтор"
      >
        <DateInput
          value={new Date(startDate)}
          onChange={(value) => {
            if (value) {
              setStartDate(value.getTime());
            }
          }}
          enableTime={false}
          disablePast={false}
          disableFuture={false}
          closeOnChange
          disablePickers={false}
          showNeighboringMonth
          disableCalendar={false}
        />
      </FormItem>

      <FormItem top={`Сообщение для "${chatTitle}"`}>
        <Textarea
          placeholder={`Сообщение для чата "${chatTitle}"`}
          value={message}
          onBlur={() => setMessage((prev) => prev.trim())}
          onChange={({ target: { value } }) => setMessage(value)}
        />
      </FormItem>

      {!button && (
        <FormItem>
          <Button
            before={<Icon24Add />}
            appearance="neutral"
            mode="outline"
            stretched
            onClick={() => {
              setButton({ link: '', label: '' });
            }}
          >
            Добавить кнопку
          </Button>
        </FormItem>
      )}

      {button && (
        <LinkButtonCreation
          {...button}
          header="Кнопка-ссылка"
          onChange={(type, value) => {
            setButton((prev = { link: '', label: '' }) => {
              return {
                ...prev,
                [type as keyof IKeyboard.LinkButton]: value,
              };
            });
          }}
          onRemove={() => setButton(undefined)}
        />
      )}

      {!!time && !!days.length && (
        <Text
          style={{
            color: 'var(--vkui--color_text_secondary)',
            margin: '8px 16px 16px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            whiteSpace: 'normal',
          }}
        >
          Это сообщение {button ? <Highlight>с кнопкой </Highlight> : ' '}будет
          отправляться <Highlight>{repeatText[repeat].name}</Highlight> месяца
          начиная с{' '}
          <Highlight>{format(new Date(startDate), 'dd.MM.yyyy')}</Highlight> в{' '}
          {days.map((day) => {
            const isBeforeLast = days.length - 1 === day;
            const isLast = days.length === day;
            return (
              <Fragment key={day}>
                <Highlight>
                  {
                    daysNames.find(({ dayNumber }) => dayNumber === day)
                      ?.nameWhen
                  }
                </Highlight>
                {isLast ? ' ' : isBeforeLast ? ' и ' : ', '}
              </Fragment>
            );
          })}{' '}
          в <Highlight>{time}</Highlight>
        </Text>
      )}
    </>
  );
};

export const Highlight: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Text
      style={{
        display: 'inline',
        color: 'var(--vkui--color_accent_blue)',
        fontWeight: 'bold',
        fontSize: 'inherit',
      }}
    >
      {children}
    </Text>
  );
};
