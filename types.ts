
export interface TodoItem {
  id: string;
  text: string;
  quadrantId: QuadrantId | null; // null or UNASSIGNED means it's in the right panel
}

export enum QuadrantId {
  URGENT_IMPORTANT = 'urgent_important',
  NOT_URGENT_IMPORTANT = 'not_urgent_important',
  URGENT_NOT_IMPORTANT = 'urgent_not_important',
  NOT_URGENT_NOT_IMPORTANT = 'not_urgent_not_important',
  UNASSIGNED = 'unassigned', // For items in the right panel
}

export interface QuadrantDefinition {
  id: QuadrantId;
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}
