export type Region = "AU" | "US" | "BOTH";
export type Market = "AU" | "US" | "BOTH";
export type Channel = "EDM" | "SMS";
export type CampaignStatus = "draft" | "scheduled" | "sent";
export type DateCategory = "public" | "school" | "retail" | "cultural" | "sporting";

export type KeyDate = {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  region: Region;
  category: DateCategory;
  notes: string;
  isSystem: boolean;
};

export type Campaign = {
  id: number;
  title: string;
  channel: Channel;
  sendDate: string;
  sendTime: string;
  market: Market;
  status: CampaignStatus;
  subject: string;
  audience: string;
  notes: string;
  keyDateId: number | null;
};

export type CampaignInput = {
  title: string;
  channel: Channel;
  sendDate: string;
  sendTime: string;
  market: Market;
  status: CampaignStatus;
  subject: string;
  audience: string;
  notes: string;
  keyDateId: number | null;
};

export type BoardData = {
  keyDates: KeyDate[];
  campaigns: Campaign[];
};

export const TOKEN_STORAGE_KEY = "chief_cal_token";
