import { getServerSession } from '@roq/nextjs';
import { NextApiRequest } from 'next';
import { NotificationService } from 'server/services/notification.service';
import { convertMethodToOperation, convertRouteToEntityUtil, HttpMethod, generateFilterByPathUtil } from 'server/utils';
import { prisma } from 'server/db';

interface NotificationConfigInterface {
  roles: string[];
  key: string;
  tenantPath: string[];
  userPath: string[];
}

const notificationMapping: Record<string, NotificationConfigInterface> = {
  'user.update': {
    roles: ['owner', 'hr-manager', 'payroll-officer'],
    key: 'employee-data-updated',
    tenantPath: ['organization', 'user'],
    userPath: [],
  },
  'payroll.create': {
    roles: ['owner', 'hr-manager'],
    key: 'new-payroll-data',
    tenantPath: ['organization', 'user', 'payroll'],
    userPath: [],
  },
  'time_tracking.update': {
    roles: ['owner', 'hr-manager', 'team-lead'],
    key: 'employee-time-tracking',
    tenantPath: ['organization', 'user', 'time_tracking'],
    userPath: [],
  },
  'vacation.update': {
    roles: ['owner', 'hr-manager', 'team-lead'],
    key: 'employee-vacation-update',
    tenantPath: ['organization', 'user', 'vacation'],
    userPath: [],
  },
  'performance_evaluation.update': {
    roles: ['owner', 'hr-manager', 'employee'],
    key: 'performance-evaluation-update',
    tenantPath: ['organization', 'user', 'performance_evaluation'],
    userPath: [],
  },
  'user.delete': {
    roles: ['owner', 'payroll-officer', 'team-lead'],
    key: 'employee-data-deleted',
    tenantPath: ['organization', 'user'],
    userPath: [],
  },
  'payroll.delete': {
    roles: ['owner', 'hr-manager'],
    key: 'payroll-data-deleted',
    tenantPath: ['organization', 'user', 'payroll'],
    userPath: [],
  },
  'performance_evaluation.delete': {
    roles: ['owner', 'hr-manager', 'employee'],
    key: 'performance-evaluation-deleted',
    tenantPath: ['organization', 'user', 'performance_evaluation'],
    userPath: [],
  },
};

const ownerRoles: string[] = ['owner'];
const customerRoles: string[] = ['customer'];
const tenantRoles: string[] = ['owner', 'hr-manager', 'payroll-officer', 'team-lead', 'employee'];

const allTenantRoles = tenantRoles.concat(ownerRoles);
export async function notificationHandlerMiddleware(req: NextApiRequest, entityId: string) {
  const session = getServerSession(req);
  const { roqUserId } = session;
  // get the entity based on the request url
  let [mainPath] = req.url.split('?');
  mainPath = mainPath.trim().split('/').filter(Boolean)[1];
  const entity = convertRouteToEntityUtil(mainPath);
  // get the operation based on request method
  const operation = convertMethodToOperation(req.method as HttpMethod);
  const notificationConfig = notificationMapping[`${entity}.${operation}`];

  if (!notificationConfig || notificationConfig.roles.length === 0 || !notificationConfig.tenantPath?.length) {
    return;
  }

  const { tenantPath, key, roles, userPath } = notificationConfig;

  const tenant = await prisma.organization.findFirst({
    where: generateFilterByPathUtil(tenantPath, entityId),
  });

  if (!tenant) {
    return;
  }
  const sendToTenant = () => {
    console.log('sending notification to tenant', {
      notificationConfig,
      roqUserId,
      tenant,
    });
    return NotificationService.sendNotificationToRoles(key, roles, roqUserId, tenant.tenant_id);
  };
  const sendToCustomer = async () => {
    if (!userPath.length) {
      return;
    }
    const user = await prisma.user.findFirst({
      where: generateFilterByPathUtil(userPath, entityId),
    });
    console.log('sending notification to user', {
      notificationConfig,
      user,
    });
    await NotificationService.sendNotificationToUser(key, user.roq_user_id);
  };

  if (roles.every((role) => allTenantRoles.includes(role))) {
    // check if only  tenantRoles + ownerRoles
    await sendToTenant();
  } else if (roles.every((role) => customerRoles.includes(role))) {
    // check if only customer role
    await sendToCustomer();
  } else {
    // both company and user receives
    await Promise.all([sendToTenant(), sendToCustomer()]);
  }
}
