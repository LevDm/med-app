export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user' | 'doctor';
  gender: 'male' | 'female';
  age: number;
  deactivated: boolean;
};

export type InputType = 'manual' | 'appleWatch';

export type TokenPayload = User & { exp: number };

export type SignUpUser = Omit<User, 'id'> & { password: string };

export type SignInUser = Omit<User, 'firstName' | 'lastName'> & { password: string };

export type UserWithDoctor = User & {
  doctor: User;
  users: User[];
  unreadMessageCount: number;
  lastCheckDate: string | null;
};

export type TokenResponse = { access_token: string; refresh_token: string };

export type MedicalParameterType =
  | 'pulse'
  | 'steps'
  | 'sleep'
  | 'saturation'
  | 'respiration'
  | 'pressure'
  | 'mass'
  | 'temperature'
  | 'workout'
  | 'form';

export type CommonParameter = { value: number };

export type MedicalParameterConstructor<T extends MedicalParameterType, D> = {
  id: string;
  createdAt?: Date | string;
  data: D;
  type: T;
  inputType: InputType;
};

export type PulseParameter = MedicalParameterConstructor<'pulse', { value: number }>;

export type StepsParameter = MedicalParameterConstructor<'steps', { value: number }>;

export type SleepParameter = MedicalParameterConstructor<'sleep', { startDate: Date | string; endDate: Date | string }>;

export type SaturationParameter = MedicalParameterConstructor<'saturation', { value: number }>;

export type RespirationParameter = MedicalParameterConstructor<'respiration', { value: number }>;

export type PressureParameter = MedicalParameterConstructor<'pressure', { sys: number; dia: number }>;

export type MassParameter = MedicalParameterConstructor<'mass', { value: number }>;

export type TemperatureParameter = MedicalParameterConstructor<'temperature', { value: number }>;

export type FormQuestions = {
  headache: string;
  weakness: string;
  feces: string;
  cough: {
    frequency: string;
    type?: string;
  };
  womanPeriods?: string;
  openField?: string;
};

export type FormParameter = MedicalParameterConstructor<'form', FormQuestions>;

export type WorkoutParameter = MedicalParameterConstructor<
  'workout',
  { startDate: Date | string; endDate: Date | string; intensity: number }
>;

export type MedicalParameter =
  | PulseParameter
  | StepsParameter
  | SleepParameter
  | SaturationParameter
  | RespirationParameter
  | PressureParameter
  | MassParameter
  | TemperatureParameter
  | WorkoutParameter
  | FormParameter;

export type MedicalParameterByType<
  T extends MedicalParameterType,
  P extends MedicalParameter = MedicalParameter,
> = P extends unknown ? (P['type'] extends T ? P : never) : never;

export type NoteType = {
  id: string;

  title: string;
  text: string;

  createdAt: Date | string;
};
