import { Bug, BugFormData, BugFilters } from '../types/Bug';

// Mock API - In a real app, this would make HTTP requests to your backend
class BugAPI {
  private static bugs: Bug[] = [];
  private static nextId = 1;

  // Simulate network delay
  private static delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all bugs with optional filters
  static async getBugs(filters?: BugFilters): Promise<Bug[]> {
    await this.delay();
    
    let filteredBugs = [...this.bugs];

    if (filters) {
      if (filters.status && filters.status.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
          filters.status!.includes(bug.status)
        );
      }

      if (filters.priority && filters.priority.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
          filters.priority!.includes(bug.priority)
        );
      }

      if (filters.assignee && filters.assignee.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
          bug.assignee && filters.assignee!.includes(bug.assignee)
        );
      }

      if (filters.reporter && filters.reporter.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
          filters.reporter!.includes(bug.reporter)
        );
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredBugs = filteredBugs.filter(bug => 
          bug.tags.some(tag => filters.tags!.includes(tag))
        );
      }

      if (filters.dateRange) {
        filteredBugs = filteredBugs.filter(bug => {
          const bugDate = new Date(bug.createdAt);
          return bugDate >= filters.dateRange!.from && 
                 bugDate <= filters.dateRange!.to;
        });
      }
    }

    return filteredBugs.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  // Get a single bug by ID
  static async getBugById(id: string): Promise<Bug | null> {
    await this.delay();
    return this.bugs.find(bug => bug.id === id) || null;
  }

  // Create a new bug
  static async createBug(bugData: BugFormData, reporter: string): Promise<Bug> {
    await this.delay();

    const newBug: Bug = {
      id: `BUG-${this.nextId.toString().padStart(3, '0')}`,
      title: bugData.title,
      description: bugData.description,
      priority: bugData.priority,
      status: bugData.status || 'open' as any,
      assignee: bugData.assignee,
      reporter,
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: bugData.dueDate,
      tags: bugData.tags,
      attachments: [],
      comments: [],
      environment: bugData.environment,
      stepsToReproduce: bugData.stepsToReproduce,
      expectedBehavior: bugData.expectedBehavior,
      actualBehavior: bugData.actualBehavior,
    };

    this.bugs.push(newBug);
    this.nextId++;

    return newBug;
  }

  // Update an existing bug
  static async updateBug(id: string, updates: Partial<Bug>): Promise<Bug | null> {
    await this.delay();

    const bugIndex = this.bugs.findIndex(bug => bug.id === id);
    if (bugIndex === -1) {
      return null;
    }

    this.bugs[bugIndex] = {
      ...this.bugs[bugIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.bugs[bugIndex];
  }

  // Delete a bug
  static async deleteBug(id: string): Promise<boolean> {
    await this.delay();

    const bugIndex = this.bugs.findIndex(bug => bug.id === id);
    if (bugIndex === -1) {
      return false;
    }

    this.bugs.splice(bugIndex, 1);
    return true;
  }

  // Search bugs by text
  static async searchBugs(query: string): Promise<Bug[]> {
    await this.delay();

    const lowerQuery = query.toLowerCase();
    return this.bugs.filter(bug => 
      bug.title.toLowerCase().includes(lowerQuery) ||
      bug.description.toLowerCase().includes(lowerQuery) ||
      bug.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      bug.id.toLowerCase().includes(lowerQuery)
    );
  }

  // Add comment to a bug
  static async addComment(bugId: string, content: string, author: string): Promise<boolean> {
    await this.delay();

    const bug = this.bugs.find(b => b.id === bugId);
    if (!bug) {
      return false;
    }

    const newComment = {
      id: `comment-${Date.now()}`,
      author,
      content,
      createdAt: new Date(),
    };

    bug.comments.push(newComment);
    bug.updatedAt = new Date();

    return true;
  }

  // Initialize with sample data (for demo purposes)
  static initializeWithSampleData(sampleBugs: Bug[]): void {
    this.bugs = [...sampleBugs];
    this.nextId = Math.max(...sampleBugs.map(bug => 
      parseInt(bug.id.replace('BUG-', ''), 10) || 0
    )) + 1;
  }
}

export default BugAPI;
