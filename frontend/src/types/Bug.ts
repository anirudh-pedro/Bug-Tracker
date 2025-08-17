export interface Bug {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: BugStatus;
  assignee?: string;
  reporter: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  attachments: Attachment[];
  comments: Comment[];
  environment?: Environment;
  stepsToReproduce?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BugStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export interface Environment {
  platform: string;
  version: string;
  device?: string;
  browser?: string;
}

export interface BugFormData {
  title: string;
  description: string;
  priority: Priority;
  status?: BugStatus;
  assignee?: string;
  tags: string[];
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment?: Environment;
  dueDate?: Date;
}

export interface BugFilters {
  status?: BugStatus[];
  priority?: Priority[];
  assignee?: string[];
  reporter?: string[];
  tags?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface BugStats {
  totalBugs: number;
  openBugs: number;
  inProgressBugs: number;
  resolvedBugs: number;
  closedBugs: number;
  criticalBugs: number;
  highPriorityBugs: number;
}
