export type UserRoleId = "employee" | "lead" | "admin";

export const roles: {
  id: UserRoleId;
  label: string;
  description: string;
}[] = [
  {
    id: "employee",
    label: "Сотрудник",
    description: "Видит только свои отпуска, профиль и свои уведомления.",
  },
  {
    id: "lead",
    label: "Лид",
    description: "Данные своей команды, дайджесты и напоминания для отчётности.",
  },
  {
    id: "admin",
    label: "Администратор",
    description: "Полный доступ к организации, пользователям и глобальным настройкам.",
  },
];

export type PermissionId =
  | "self.data"
  | "self.requests"
  | "team.view"
  | "team.calendar"
  | "org.view_all"
  | "org.settings"
  | "users.manage"
  | "reports.export"
  | "integrations.manage";

export const permissionGroups: {
  title: string;
  items: { id: PermissionId; label: string; hint?: string }[];
}[] = [
  {
    title: "Личные данные",
    items: [
      { id: "self.data", label: "Просмотр и редактирование своего профиля" },
      { id: "self.requests", label: "Создание и отмена своих заявок на отсутствие" },
    ],
  },
  {
    title: "Команда",
    items: [
      { id: "team.view", label: "Просмотр отсутствий и календаря команды" },
      { id: "team.calendar", label: "Редактирование командных напоминаний и дайджестов" },
    ],
  },
  {
    title: "Организация",
    items: [
      { id: "org.view_all", label: "Просмотр всех сотрудников и отчётов" },
      { id: "org.settings", label: "Глобальные настройки портала и расписаний уведомлений" },
    ],
  },
  {
    title: "Администрирование",
    items: [
      { id: "users.manage", label: "Создание пользователей, роли и права" },
      { id: "reports.export", label: "Выгрузка отчётов и аудит" },
      { id: "integrations.manage", label: "Интеграции (календарь, внешние сервисы)" },
    ],
  },
];

/** Права, включаемые по умолчанию для роли (базовый шаблон) */
export const defaultPermissionsForRole: Record<UserRoleId, PermissionId[]> = {
  employee: ["self.data", "self.requests"],
  lead: [
    "self.data",
    "self.requests",
    "team.view",
    "team.calendar",
    "reports.export",
  ],
  admin: [
    "self.data",
    "self.requests",
    "team.view",
    "team.calendar",
    "org.view_all",
    "org.settings",
    "users.manage",
    "reports.export",
    "integrations.manage",
  ],
};

export function buildPermissionMap(role: UserRoleId): Record<PermissionId, boolean> {
  const allowed = new Set(defaultPermissionsForRole[role]);
  const all: PermissionId[] = permissionGroups.flatMap((g) => g.items.map((i) => i.id));
  const map = {} as Record<PermissionId, boolean>;
  for (const id of all) {
    map[id] = allowed.has(id);
  }
  return map;
}
