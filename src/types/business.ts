export interface Company {
  id: number
  sodtype: number
  trdr?: number | null
  code: string
  name: string
  afm: string
  country?: string | null
  address?: string | null
  zip?: string | null
  city?: string | null
  phone01?: string | null
  phone02?: string | null
  fax?: string | null
  jobtypetrd?: number | null
  webpage?: string | null
  email?: string | null
  emailacc?: string | null
  irsdata?: any | null
  sotitle?: string | null
  concent?: boolean | null
  upddate: Date
}

export interface BusinessContact {
  id: number
  name: string
  title?: string | null
  description?: string | null
  phone?: string | null
  mobile?: string | null
  workPhone?: string | null
  email?: string | null
  address?: string | null
  city?: string | null
  zip?: string | null
  country?: string | null
}

export interface ContactCompany {
  contactId: number
  companyId: number
  position?: string | null
  description?: string | null
  // Relations
  contact?: BusinessContact
  company?: Company
}

export interface ContactWithCompanies extends BusinessContact {
  companies: (ContactCompany & { company: Company })[]
}

export interface CompanyWithContacts extends Company {
  contactCompanies: (ContactCompany & { contact: BusinessContact })[]
}

export interface CreateContactData {
  name: string
  title?: string
  description?: string
  phone?: string
  mobile?: string
  workPhone?: string
  email?: string
  address?: string
  city?: string
  zip?: string
  country?: string
}

export interface UpdateContactData extends Partial<CreateContactData> {
  id: number
}

export interface CreateContactCompanyData {
  contactId: number
  companyId: number
  position?: string
  description?: string
}

export interface UpdateContactCompanyData {
  contactId: number
  companyId: number
  position?: string
  description?: string
}
