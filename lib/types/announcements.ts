export type AnnouncementType = "info" | "warning" | "urgent";

export type PublicAnnouncement = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  createdAt: string; // ISO
};
