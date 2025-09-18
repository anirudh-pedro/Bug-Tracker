import React from 'react';
import { apiRequest } from './networkUtils';

class RealTimeManager {
  constructor() {
    this.listeners = new Map();
    this.pollingIntervals = new Map();
    this.isPolling = false;
  }

  // Subscribe to bug updates
  subscribeToBug(bugId, callback, pollingInterval = 30000) {
    if (!this.listeners.has(bugId)) {
      this.listeners.set(bugId, new Set());
    }
    
    this.listeners.get(bugId).add(callback);
    
    // Start polling for this bug if not already polling
    if (!this.pollingIntervals.has(bugId)) {
      this.startPollingForBug(bugId, pollingInterval);
    }
    
    return () => this.unsubscribeFromBug(bugId, callback);
  }

  // Unsubscribe from bug updates
  unsubscribeFromBug(bugId, callback) {
    const bugListeners = this.listeners.get(bugId);
    if (bugListeners) {
      bugListeners.delete(callback);
      
      // If no more listeners for this bug, stop polling
      if (bugListeners.size === 0) {
        this.stopPollingForBug(bugId);
        this.listeners.delete(bugId);
      }
    }
  }

  // Start polling for a specific bug
  startPollingForBug(bugId, interval) {
    if (this.pollingIntervals.has(bugId)) {
      return; // Already polling
    }

    const pollBug = async () => {
      try {
        const [bugResponse, githubResponse] = await Promise.all([
          apiRequest(`/api/bugs/${bugId}`),
          apiRequest(`/api/github/activity/${bugId}`)
        ]);

        let updateData = {};

        if (bugResponse.ok) {
          const bugData = await bugResponse.json();
          updateData.bug = bugData.data.bug;
        }

        if (githubResponse.ok) {
          const githubData = await githubResponse.json();
          updateData.github = githubData.data;
        }

        // Notify all listeners
        const listeners = this.listeners.get(bugId);
        if (listeners && listeners.size > 0) {
          listeners.forEach(callback => {
            try {
              callback(updateData);
            } catch (error) {
              console.error('Error in real-time listener:', error);
            }
          });
        }

      } catch (error) {
        console.error('Error polling bug updates:', error);
      }
    };

    // Initial poll
    pollBug();

    // Set up interval
    const intervalId = setInterval(pollBug, interval);
    this.pollingIntervals.set(bugId, intervalId);
  }

  // Stop polling for a specific bug
  stopPollingForBug(bugId) {
    const intervalId = this.pollingIntervals.get(bugId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(bugId);
    }
  }

  // Subscribe to bugs list updates
  subscribeToBugsList(callback, pollingInterval = 60000) {
    const listenerId = 'bugs_list';
    
    if (!this.listeners.has(listenerId)) {
      this.listeners.set(listenerId, new Set());
    }
    
    this.listeners.get(listenerId).add(callback);
    
    // Start polling for bugs list if not already polling
    if (!this.pollingIntervals.has(listenerId)) {
      this.startPollingForBugsList(pollingInterval);
    }
    
    return () => this.unsubscribeFromBugsList(callback);
  }

  // Unsubscribe from bugs list updates
  unsubscribeFromBugsList(callback) {
    const listenerId = 'bugs_list';
    const listeners = this.listeners.get(listenerId);
    if (listeners) {
      listeners.delete(callback);
      
      // If no more listeners, stop polling
      if (listeners.size === 0) {
        this.stopPollingForBugsList();
        this.listeners.delete(listenerId);
      }
    }
  }

  // Start polling for bugs list
  startPollingForBugsList(interval) {
    const listenerId = 'bugs_list';
    
    if (this.pollingIntervals.has(listenerId)) {
      return; // Already polling
    }

    const pollBugsList = async () => {
      try {
        const response = await apiRequest('/api/bugs?limit=50&sortBy=createdAt&sortOrder=desc');
        
        if (response.ok) {
          const data = await response.json();
          
          // Notify all listeners
          const listeners = this.listeners.get(listenerId);
          if (listeners && listeners.size > 0) {
            listeners.forEach(callback => {
              try {
                callback(data.data.bugs || []);
              } catch (error) {
                console.error('Error in bugs list listener:', error);
              }
            });
          }
        }

      } catch (error) {
        console.error('Error polling bugs list updates:', error);
      }
    };

    // Set up interval
    const intervalId = setInterval(pollBugsList, interval);
    this.pollingIntervals.set(listenerId, intervalId);
  }

  // Stop polling for bugs list
  stopPollingForBugsList() {
    const listenerId = 'bugs_list';
    const intervalId = this.pollingIntervals.get(listenerId);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(listenerId);
    }
  }

  // Trigger manual update for a bug
  async triggerBugUpdate(bugId) {
    try {
      const [bugResponse, githubResponse] = await Promise.all([
        apiRequest(`/api/bugs/${bugId}`),
        apiRequest(`/api/github/activity/${bugId}`)
      ]);

      let updateData = {};

      if (bugResponse.ok) {
        const bugData = await bugResponse.json();
        updateData.bug = bugData.data.bug;
      }

      if (githubResponse.ok) {
        const githubData = await githubResponse.json();
        updateData.github = githubData.data;
      }

      // Notify listeners
      const listeners = this.listeners.get(bugId);
      if (listeners && listeners.size > 0) {
        listeners.forEach(callback => {
          try {
            callback(updateData);
          } catch (error) {
            console.error('Error in manual update listener:', error);
          }
        });
      }

      return updateData;

    } catch (error) {
      console.error('Error triggering bug update:', error);
      throw error;
    }
  }

  // Trigger manual update for bugs list
  async triggerBugsListUpdate() {
    try {
      const response = await apiRequest('/api/bugs?limit=50&sortBy=createdAt&sortOrder=desc');
      
      if (response.ok) {
        const data = await response.json();
        const bugs = data.data.bugs || [];
        
        // Notify listeners
        const listenerId = 'bugs_list';
        const listeners = this.listeners.get(listenerId);
        if (listeners && listeners.size > 0) {
          listeners.forEach(callback => {
            try {
              callback(bugs);
            } catch (error) {
              console.error('Error in manual bugs list update listener:', error);
            }
          });
        }

        return bugs;
      }

    } catch (error) {
      console.error('Error triggering bugs list update:', error);
      throw error;
    }
  }

  // Clean up all subscriptions and intervals
  cleanup() {
    // Clear all intervals
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    
    // Clear all data
    this.pollingIntervals.clear();
    this.listeners.clear();
  }

  // Get status of real-time manager
  getStatus() {
    return {
      activePolls: this.pollingIntervals.size,
      activeListeners: Array.from(this.listeners.entries()).map(([id, listeners]) => ({
        id,
        listenerCount: listeners.size
      }))
    };
  }

  // Set polling interval for a specific bug
  setPollingInterval(bugId, newInterval) {
    if (this.pollingIntervals.has(bugId)) {
      this.stopPollingForBug(bugId);
      this.startPollingForBug(bugId, newInterval);
    }
  }

  // Pause all polling
  pauseAllPolling() {
    this.pollingIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.pollingIntervals.clear();
  }

  // Resume polling for all active subscriptions
  resumeAllPolling() {
    this.listeners.forEach((listeners, id) => {
      if (listeners.size > 0) {
        if (id === 'bugs_list') {
          this.startPollingForBugsList(60000);
        } else {
          this.startPollingForBug(id, 30000);
        }
      }
    });
  }
}

// Create and export singleton instance
const realTimeManager = new RealTimeManager();

export default realTimeManager;

// Export hook for React components
export const useRealTimeBug = (bugId, pollingInterval = 30000) => {
  const [bugData, setBugData] = React.useState(null);
  const [githubData, setGithubData] = React.useState(null);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    if (!bugId) return;

    const handleUpdate = (updateData) => {
      if (updateData.bug) {
        setBugData(updateData.bug);
      }
      if (updateData.github) {
        setGithubData(updateData.github);
      }
      setLastUpdate(new Date());
    };

    const unsubscribe = realTimeManager.subscribeToBug(bugId, handleUpdate, pollingInterval);

    return unsubscribe;
  }, [bugId, pollingInterval]);

  const triggerUpdate = () => {
    return realTimeManager.triggerBugUpdate(bugId);
  };

  return {
    bugData,
    githubData,
    lastUpdate,
    triggerUpdate
  };
};

// Export hook for bugs list
export const useRealTimeBugsList = (pollingInterval = 60000) => {
  const [bugs, setBugs] = React.useState([]);
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  React.useEffect(() => {
    const handleUpdate = (updatedBugs) => {
      setBugs(updatedBugs);
      setLastUpdate(new Date());
    };

    const unsubscribe = realTimeManager.subscribeToBugsList(handleUpdate, pollingInterval);

    return unsubscribe;
  }, [pollingInterval]);

  const triggerUpdate = () => {
    return realTimeManager.triggerBugsListUpdate();
  };

  return {
    bugs,
    lastUpdate,
    triggerUpdate
  };
};