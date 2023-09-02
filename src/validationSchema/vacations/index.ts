import * as yup from 'yup';

export const vacationValidationSchema = yup.object().shape({
  start_date: yup.date().required(),
  end_date: yup.date().required(),
  total_days: yup.number().integer().required(),
  remaining_days: yup.number().integer().required(),
  user_id: yup.string().nullable().required(),
});
