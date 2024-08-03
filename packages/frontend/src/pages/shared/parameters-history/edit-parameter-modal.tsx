import { useCallback } from 'react';

import { MedicalParameterByType, MedicalParameterType, useEditParameterRequest } from '../../../api';
import { useWithNotification } from '../../../ui-components';
import { parameterTypeToTitle } from '../../consts';
import { InputFormModal } from '../parameter-input-form';

type EditParameterModalProps<T extends MedicalParameterType> = {
  edit?: boolean;
  open: boolean;
  parameter: MedicalParameterByType<T> | null;
  onClose(): void;
  onEdit(parameter: MedicalParameterByType<T>): void;
};

export const EditParameterModal = <T extends MedicalParameterType>({
  edit,
  open,
  parameter,
  onClose,
  onEdit,
}: EditParameterModalProps<T>) => {
  const { isLoading, editParameter } = useEditParameterRequest({
    onSuccess: onEdit,
  });

  const { withNotification } = useWithNotification();

  const handleEditParameter = useCallback(
    (editedParameter: MedicalParameterByType<T>) => {
      if (!parameter) return;

      const { id, type } = parameter;

      withNotification(() => editParameter({ parameterId: id, ...editedParameter }), {
        successMsg: `Параметр "${parameterTypeToTitle[type]}" успешно отредактирован`,
        errorMsg: `Ошибка при редактировании параметра "${parameterTypeToTitle[type]}"`,
      })();
    },
    [parameter],
  );

  if (!parameter) return null;

  return (
    <InputFormModal
      edit={edit}
      open={open}
      loading={isLoading}
      type={parameter.type}
      defaultValues={parameter}
      onAddParameter={handleEditParameter}
      onClose={onClose}
    />
  );
};
