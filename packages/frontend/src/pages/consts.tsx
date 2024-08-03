import AirIcon from '@mui/icons-material/Air';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';

import { InputType, MedicalParameterType, User } from '../api';

export const parameterTypeToTitle = {
  pulse: 'Пульс',
  sleep: 'Сон',
  steps: 'Шаги',
  saturation: 'Сатурация',
  respiration: 'Частота дыхания',
  pressure: 'Давление',
  mass: 'Масса',
  temperature: 'Температура',
  workout: 'Тренировки',
  form: 'Анкета',
  export: 'Импорт с устройства',
} satisfies Record<MedicalParameterType | 'export', string>;

export const parameterTypeToIcon = {
  pulse: <MonitorHeartIcon />,
  sleep: <HotelIcon />,
  steps: <DirectionsRunIcon />,
  saturation: <BloodtypeIcon />,
  respiration: <AirIcon />,
  pressure: <BloodtypeIcon />,
  mass: <MonitorWeightIcon />,
  temperature: <DeviceThermostatIcon />,
  workout: <FitnessCenterIcon />,
  form: <IntegrationInstructionsIcon />,
} satisfies Record<MedicalParameterType, React.ReactNode>;

export const roleToTitleMap = {
  user: 'Пациент',
  doctor: 'Врач',
  admin: 'Администратор',
} satisfies Record<User['role'], string>;

export const inputTypeToTitleMap = {
  manual: 'Вручную',
  appleWatch: 'Apple Watch',
} satisfies Record<InputType, string>;
