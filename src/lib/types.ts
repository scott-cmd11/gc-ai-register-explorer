export interface AISystem {
  _id: number
  ai_register_id: string
  name_ai_system_en: string
  name_ai_system_fr: string
  government_organization: string
  description_ai_system_en: string
  description_ai_system_fr: string
  ai_system_primary_users_en: string
  ai_system_primary_users_fr: string
  developed_by_en: string
  developed_by_fr: string
  vendor_information: string
  ai_system_status_en: string
  ai_system_status_fr: string
  status_date: string
  ai_system_capabilities_en: string
  ai_system_capabilities_fr: string
  data_sources_en: string
  data_sources_fr: string
  involves_personal_information: string
  personal_information_banks_en: string
  personal_information_banks_fr: string
  notification_ai: string
  ai_system_results_en: string
  ai_system_results_fr: string
}

export interface Filters {
  department: string
  status: string
  personalInfo: string
  developedBy: string
  notificationAi: string
}

export type SortField = keyof AISystem | ''
export type SortDir = 'asc' | 'desc'
