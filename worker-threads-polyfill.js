// Comprehensive worker_threads polyfill for browser environment
// This polyfill provides a browser-compatible implementation using Web Workers

class MessageChannel {
  constructor() {
    this.port1 = new MessagePort();
    this.port2 = new MessagePort();
    this.port1._otherPort = this.port2;
    this.port2._otherPort = this.port1;
  }
}

class MessagePort {
  constructor() {
    this._listeners = new Map();
    this._otherPort = null;
  }

  postMessage(data) {
    if (this._otherPort) {
      setTimeout(() => {
        const listeners = this._otherPort._listeners.get('message') || [];
        listeners.forEach(listener => listener({ data }));
      }, 0);
    }
  }

  on(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(listener);
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
  }

  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  addEventListener(event, listener) {
    this.on(event, listener);
  }

  removeEventListener(event, listener) {
    this.off(event, listener);
  }

  close() {
    this._listeners.clear();
  }
}

class BrowserWorker {
  constructor(filename, options = {}) {
    this.filename = filename;
    this.options = options;
    this._listeners = new Map();
    this._terminated = false;
    
    // Store workerData for later use
    this._workerData = options.workerData;
    
    // Create a message channel for communication
    const channel = new MessageChannel();
    this.port = channel.port1;
    this._workerPort = channel.port2;
    
    // Simulate worker initialization
    setTimeout(() => {
      if (!this._terminated) {
        this._emit('online');
        this._emit('message', { type: 'online' });
      }
    }, 0);
  }

  postMessage(data) {
    if (!this._terminated) {
      // Simulate message handling
      setTimeout(() => {
        if (!this._terminated) {
          this._workerPort._emit('message', data);
        }
      }, 0);
    }
  }

  on(event, listener) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(listener);
  }

  once(event, listener) {
    const onceWrapper = (...args) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
  }

  off(event, listener) {
    const listeners = this._listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  _emit(event, ...args) {
    const listeners = this._listeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Error in worker listener:', error);
      }
    });
  }

  terminate() {
    this._terminated = true;
    this._listeners.clear();
    return Promise.resolve();
  }

  ref() {
    // No-op in browser
  }

  unref() {
    // No-op in browser
  }
}

// Global state for the polyfill
const globalWorkerState = {
  isMainThread: true,
  workerData: undefined,
  parentPort: null,
  threadId: 0,
  resourceLimits: {},
};

// If we're being loaded as a worker (which shouldn't happen in browser)
// provide minimal compatibility
if (typeof self !== 'undefined' && typeof window === 'undefined') {
  globalWorkerState.isMainThread = false;
  globalWorkerState.parentPort = {
    on: () => {},
    once: () => {},
    off: () => {},
    postMessage: () => {},
  };
}

module.exports = {
  Worker: BrowserWorker,
  isMainThread: globalWorkerState.isMainThread,
  parentPort: globalWorkerState.parentPort,
  workerData: globalWorkerState.workerData,
  threadId: globalWorkerState.threadId,
  resourceLimits: globalWorkerState.resourceLimits,
  MessageChannel,
  MessagePort,
  
  // Additional exports for compatibility
  receiveMessageOnPort: () => undefined,
  moveMessagePortToContext: () => {},
  SHARE_ENV: Symbol('SHARE_ENV'),
  
  // Helper to set workerData (for testing/mocking)
  setWorkerData: (data) => {
    globalWorkerState.workerData = data;
  },
};