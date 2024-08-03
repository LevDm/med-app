import { massParser } from './mass-parser';
import { pressureParser } from './pressure-parser';
import { pulseParser } from './pulse-parser';
import { respirationParser } from './respiration-parser';
import { saturationParser } from './saturation-parser';
import { sleepParser } from './sleep-parser';
import { stepsParser } from './steps-parser';
import { temperatureParser } from './temperature-parser';
import { workoutParser } from './workout-parser';

export const parsers = [
  pulseParser,
  sleepParser,
  saturationParser,
  stepsParser,
  massParser,
  respirationParser,
  temperatureParser,
  pressureParser,
  workoutParser,
];
