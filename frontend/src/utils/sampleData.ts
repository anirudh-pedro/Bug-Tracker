import { Bug, Priority, BugStatus } from '../types/Bug';

export const sampleBugs: Bug[] = [
  {
    id: 'BUG-001',
    title: 'UI Button not responding',
    description: 'Submit button in login form is not clickable on Android devices. Users are unable to submit their credentials after entering username and password.',
    priority: Priority.HIGH,
    status: BugStatus.OPEN,
    assignee: 'John Doe',
    reporter: 'Jane Smith',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    tags: ['UI', 'Android', 'Login'],
    attachments: [],
    comments: [
      {
        id: 'comment-1',
        author: 'John Doe',
        content: 'I can reproduce this issue on Android 12. Looking into it.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ],
    environment: {
      platform: 'Android',
      version: '12',
      device: 'Samsung Galaxy S21',
    },
    stepsToReproduce: [
      'Open the app',
      'Navigate to login screen',
      'Enter valid credentials',
      'Tap submit button',
    ],
    expectedBehavior: 'User should be logged in successfully',
    actualBehavior: 'Button does not respond to taps',
  },
  {
    id: 'BUG-002',
    title: 'Loading spinner stuck',
    description: 'Loading spinner continues to show even after data is loaded in the bug list screen.',
    priority: Priority.MEDIUM,
    status: BugStatus.IN_PROGRESS,
    assignee: 'Mike Johnson',
    reporter: 'Sarah Wilson',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    tags: ['UI', 'Loading', 'Performance'],
    attachments: [],
    comments: [],
    environment: {
      platform: 'iOS',
      version: '16.0',
      device: 'iPhone 14',
    },
    stepsToReproduce: [
      'Open the app',
      'Navigate to bug list',
      'Wait for data to load',
    ],
    expectedBehavior: 'Loading spinner should disappear when data is loaded',
    actualBehavior: 'Loading spinner remains visible indefinitely',
  },
  {
    id: 'BUG-003',
    title: 'Text overflow in profile',
    description: 'Long usernames cause text to overflow in profile section, making it unreadable.',
    priority: Priority.LOW,
    status: BugStatus.RESOLVED,
    assignee: 'Emma Davis',
    reporter: 'Tom Brown',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    tags: ['UI', 'Profile', 'Text'],
    attachments: [],
    comments: [
      {
        id: 'comment-2',
        author: 'Emma Davis',
        content: 'Fixed by implementing text truncation with ellipsis.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
    environment: {
      platform: 'Web',
      version: '1.0.0',
      browser: 'Chrome 120',
    },
  },
  {
    id: 'BUG-004',
    title: 'App crashes on file upload',
    description: 'Application crashes when trying to upload files larger than 10MB.',
    priority: Priority.CRITICAL,
    status: BugStatus.OPEN,
    assignee: 'Alex Rodriguez',
    reporter: 'Lisa Chen',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    tags: ['Crash', 'File Upload', 'Critical'],
    attachments: [],
    comments: [],
    environment: {
      platform: 'iOS',
      version: '16.2',
      device: 'iPhone 13 Pro',
    },
    stepsToReproduce: [
      'Open the app',
      'Go to bug report form',
      'Try to attach a file larger than 10MB',
      'Tap upload',
    ],
    expectedBehavior: 'File should upload or show error message',
    actualBehavior: 'App crashes immediately',
  },
  {
    id: 'BUG-005',
    title: 'Search results not updating',
    description: 'Search functionality is not working properly. Results do not update when search query changes.',
    priority: Priority.MEDIUM,
    status: BugStatus.REOPENED,
    assignee: 'David Lee',
    reporter: 'Maria Garcia',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    tags: ['Search', 'Functionality'],
    attachments: [],
    comments: [
      {
        id: 'comment-3',
        author: 'David Lee',
        content: 'Initially thought this was fixed, but the issue persists in production.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ],
    environment: {
      platform: 'Android',
      version: '13',
      device: 'Google Pixel 7',
    },
  },
];

export const getBugStats = (bugs: Bug[]) => {
  return {
    totalBugs: bugs.length,
    openBugs: bugs.filter(bug => bug.status === BugStatus.OPEN).length,
    inProgressBugs: bugs.filter(bug => bug.status === BugStatus.IN_PROGRESS).length,
    resolvedBugs: bugs.filter(bug => bug.status === BugStatus.RESOLVED).length,
    closedBugs: bugs.filter(bug => bug.status === BugStatus.CLOSED).length,
    criticalBugs: bugs.filter(bug => bug.priority === Priority.CRITICAL).length,
    highPriorityBugs: bugs.filter(bug => bug.priority === Priority.HIGH).length,
  };
};

export const generateBugId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `BUG-${timestamp}-${random}`;
};
