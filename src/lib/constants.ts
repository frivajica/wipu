export const DEFAULT_PERIOD_TYPE = "monthly" as const;

export const PERIOD_TYPES = [
  { value: "monthly" as const, label: "Monthly" },
  { value: "weekly" as const, label: "Weekly" },
  { value: "bi-weekly" as const, label: "Bi-Weekly" },
  { value: "custom" as const, label: "Custom" },
];

export const STORAGE_KEYS = {
  AUTH: "wipu_auth",
  SPACES: "wipu_spaces",
  LEDGER: "wipu_ledger",
  CATEGORIES: "wipu_categories",
  UI_STATE: "wipu_ui_state",
} as const;
