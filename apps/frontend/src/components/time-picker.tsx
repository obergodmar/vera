import { FC } from 'react';
import TimePickerComponent, {
  TimePickerProps,
} from 'react-time-picker/dist/entry.nostyle';

import './time-picker.css';

export const TimePicker: FC<TimePickerProps> = (props) => {
  return (
    <TimePickerComponent
      disableClock
      clearIcon={null}
      locale="ru-ru"
      autoFocus={false}
      hourPlaceholder="чч"
      minutePlaceholder="мм"
      format="HH:mm"
      {...props}
    />
  );
};
