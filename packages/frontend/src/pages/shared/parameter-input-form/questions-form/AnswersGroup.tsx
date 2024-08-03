import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

type AnswersGroupProps = {
  type: string;
  title: string;
  values: string[];
  onChange(value: string): void;
};

export const AnswersGroup = (props: AnswersGroupProps) => {
  const { type, title, values, onChange } = props;

  const change = (_: unknown, value: string) => {
    onChange(value);
  };

  return (
    <FormControl>
      <FormLabel id={`${type}-group-label`}>{title}</FormLabel>
      <RadioGroup
        aria-labelledby={`${type}-buttons-group-label`}
        //defaultValue="female"
        onChange={change}
        name="radio-buttons-group"
      >
        {values.map((value: string) => (
          <FormControlLabel value={value} control={<Radio />} label={value} />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
