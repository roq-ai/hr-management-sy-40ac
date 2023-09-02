import * as yup from 'yup';

export const payrollValidationSchema = yup.object().shape({
  salary: yup.number().integer().required(),
  bonus: yup.number().integer().required(),
  deductions: yup.number().integer().required(),
  net_pay: yup.number().integer().required(),
  pay_date: yup.date().required(),
  user_id: yup.string().nullable().required(),
});
