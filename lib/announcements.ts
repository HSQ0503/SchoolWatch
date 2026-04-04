export type AnnouncementType = "info" | "warning" | "urgent";

export type Announcement = {
  id?: string;
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  active: boolean;
  expiresAt?: string | null;
  createdAt?: string;
};

export const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "urgent", label: "Urgent" },
];
