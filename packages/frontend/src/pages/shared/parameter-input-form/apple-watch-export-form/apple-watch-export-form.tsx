import { useDropzone } from 'react-dropzone';

import LoadingButton from '@mui/lab/LoadingButton';
import { Typography } from '@mui/material';

import { makeStyles } from 'tss-react/mui';

import { useImportParametersRequest } from '../../../../api';
import { useWithNotification } from '../../../../ui-components';

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    minWidth: 300,
  },
  dropzone: {
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(1.5, 2),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.palette.action.disabled,
    '&:active': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

type AppleWatchExportFormProps = {
  refetchParameters(): void;
};

export const AppleWatchExportForm = ({ refetchParameters }: AppleWatchExportFormProps) => {
  const { isLoading, importParameters } = useImportParametersRequest({ onSuccess: refetchParameters });

  const { getInputProps, getRootProps, acceptedFiles } = useDropzone({
    accept: { 'application/zip': ['.zip'] },
    maxFiles: 1,
  });

  const { classes } = useStyles();

  const { withNotification } = useWithNotification();

  const fileName = acceptedFiles?.length ? acceptedFiles[0].name : '';

  const handleImport = withNotification(
    async () => {
      const [file] = acceptedFiles;

      if (file) await importParameters({ file });
    },
    { successMsg: 'Данные успешно импортированы', errorMsg: 'Ошибка при импорте данных' },
  );

  return (
    <div className={classes.root}>
      <div
        {...getRootProps({
          className: classes.dropzone,
          onDrop: (event) => event.stopPropagation(),
        })}
      >
        <input {...getInputProps()} />
        <Typography whiteSpace="pre" textAlign="center">
          {fileName || 'Перетяните файл или нажмите\nдля выбора файла'}
        </Typography>
      </div>

      <LoadingButton onClick={handleImport} loading={isLoading} type="button">
        Импортировать
      </LoadingButton>
    </div>
  );
};
