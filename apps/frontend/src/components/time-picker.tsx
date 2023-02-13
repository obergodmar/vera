import { FC } from 'react';
import TimePickerComponent, {
  TimePickerProps,
} from 'react-time-picker/dist/entry.nostyle';

import './time-picker.css';

export const TimePicker: FC<TimePickerProps> = (props) => {
  return <TimePickerComponent disableClock clearIcon={null} {...props} />;
};
