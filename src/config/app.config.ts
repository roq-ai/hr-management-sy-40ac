interface AppConfigInterface {
  ownerRoles: string[];
  customerRoles: string[];
  tenantRoles: string[];
  tenantName: string;
  applicationName: string;
  addOns: string[];
  ownerAbilities: string[];
  customerAbilities: string[];
}
export const appConfig: AppConfigInterface = {
  ownerRoles: ['Owner'],
  customerRoles: ['Customer'],
  tenantRoles: ['Owner', 'HR Manager', 'Payroll Officer', 'Team Lead', 'Employee'],
  tenantName: 'Organization',
  applicationName: 'HR Management System',
  addOns: ['file upload', 'chat', 'notifications', 'file'],
  customerAbilities: ['View Employee data.'],
  ownerAbilities: [
    'Manage Organizations',
    'Invite HR Manager, Payroll Officer, Team Lead and Employees to the system',
    'Delete Organizations, HR Managers, Payroll Officers, Team Leads, and Employees from the system',
  ],
};
