import pl from 'nodejs-polars';

import { MedicalParameterDto } from '../../dto';

export const workoutParser = (df: pl.DataFrame): MedicalParameterDto[] => {
  const workoutDf = df.filter(pl.col('type').isIn(['']));
  const result: MedicalParameterDto[] = [];

  for (const date of workoutDf.getColumn('createdAt').unique()) {
    const endDate = workoutDf
      .filter(pl.col('createdAt').isIn([date]))
      .getColumn('endDate')
      .toArray()[0];
    const startDate = workoutDf
      .filter(pl.col('createdAt').isIn([date]))
      .getColumn('startDate')
      .toArray()[0];
    let intensity = 1;
    if (
      workoutDf
        .filter(pl.col('createdAt').isIn([date]))
        .getColumn('workoutActivityType')
        .toArray()[0] != 'HKWorkoutActivityTypeTraditionalStrengthTraining'
    ) {
      intensity -= 0.5;
    }

    result.push({ type: 'workout', createdAt: date, data: { endDate, intensity, startDate } });
  }

  return result;
};
