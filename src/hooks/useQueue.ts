import { useState, useCallback, useRef } from 'react';

export interface QueueRequest {
  id: string;
  requestId: string;
  model: string;
  prompt: string;
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  queuePosition?: number;
  progress?: number;
  logs?: Array<{
    message: string;
    level: string;
    source: string;
    timestamp: string;
  }>;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface QueueStatus {
  status: 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  queue_position?: number;
  logs?: Array<{
    message: string;
    level: string;
    source: string;
    timestamp: string;
  }>;
  response_url?: string;
}

export const useQueue = () => {
  const [requests, setRequests] = useState<QueueRequest[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Submit a new request to the queue
  const submitRequest = useCallback(async (
    model: string,
    input: any,
    prompt: string
  ): Promise<string> => {
    try {
      console.log('🚀 [Queue] Submitting request:', { model, prompt });

      const response = await fetch('/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, input }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const requestId = data.request_id;

      // Create a new queue request
      const newRequest: QueueRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId,
        model,
        prompt,
        status: 'IN_QUEUE',
        createdAt: new Date(),
      };

      console.log('🔄 [Queue] Adding new request:', newRequest);
      setRequests(prev => {
        const updated = [...prev, newRequest];
        console.log('🔄 [Queue] Updated requests array:', updated.map(req => ({ id: req.requestId, status: req.status })));
        return updated;
      });

      // Start polling if not already polling
      if (!isPolling) {
        console.log('🔄 [Queue] Starting polling for new request');
        startPolling();
      } else {
        console.log('🔄 [Queue] Polling already active');
      }

      console.log('✅ [Queue] Request submitted successfully:', requestId);
      return requestId;

    } catch (error: any) {
      console.error('❌ [Queue] Error submitting request:', error);
      throw error;
    }
  }, [isPolling]);

  // Check status of a specific request
  const checkStatus = useCallback(async (requestId: string, model: string): Promise<QueueStatus> => {
    try {
      const response = await fetch(`/api/queue?request_id=${requestId}&model=${model}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const status: QueueStatus = await response.json();
      return status;

    } catch (error: any) {
      console.error('❌ [Queue] Error checking status:', error);
      throw error;
    }
  }, []);

  // Get the final result of a completed request
  const getResult = useCallback(async (requestId: string, model: string) => {
    try {
      const response = await fetch(`/api/queue/result?request_id=${requestId}&model=${model}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error: any) {
      console.error('❌ [Queue] Error getting result:', error);
      throw error;
    }
  }, []);

  // Update request status
  const updateRequestStatus = useCallback((requestId: string, updates: Partial<QueueRequest>) => {
    setRequests(prev => prev.map(req => 
      req.requestId === requestId 
        ? { ...req, ...updates }
        : req
    ));
  }, []);

  // Cancel a request
  const cancelRequest = useCallback(async (requestId: string, model: string) => {
    try {
      console.log('❌ [Queue] Cancelling request:', requestId);

      const response = await fetch(`/api/queue/cancel?request_id=${requestId}&model=${model}`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (response.ok && data.status === 'CANCELLATION_REQUESTED') {
        updateRequestStatus(requestId, {
          status: 'CANCELLED',
          completedAt: new Date(),
        });
        console.log('✅ [Queue] Request cancelled successfully:', requestId);
        return { success: true, message: 'Request cancelled successfully' };
      } else if (data.status === 'ALREADY_COMPLETED') {
        console.log('⚠️ [Queue] Request already completed, cannot cancel:', requestId);
        return { success: false, message: 'Request already completed and cannot be cancelled' };
      } else {
        throw new Error(data.message || 'Failed to cancel request');
      }

    } catch (error: any) {
      console.error('❌ [Queue] Error cancelling request:', error);
      throw error;
    }
  }, [updateRequestStatus]);

  // Poll for status updates
  const pollStatus = useCallback(async () => {
    const activeRequests = requests.filter(req => 
      req.status === 'IN_QUEUE' || req.status === 'IN_PROGRESS'
    );

    console.log('🔄 [Queue] All requests:', requests.map(req => ({ id: req.requestId, status: req.status })));
    console.log('🔄 [Queue] Active requests:', activeRequests.length);

    if (activeRequests.length === 0) {
      console.log('🔄 [Queue] No active requests, stopping polling');
      stopPolling();
      return;
    }

    console.log('🔄 [Queue] Polling status for', activeRequests.length, 'requests');

    for (const request of activeRequests) {
      try {
        const status = await checkStatus(request.requestId, request.model);
        
        updateRequestStatus(request.requestId, {
          status: status.status,
          queuePosition: status.queue_position,
          logs: status.logs,
        });

        // If completed, get the result
        if (status.status === 'COMPLETED') {
          try {
            const result = await getResult(request.requestId, request.model);
            updateRequestStatus(request.requestId, {
              status: 'COMPLETED',
              result: result.data || result.response,
              completedAt: new Date(),
            });
            console.log('✅ [Queue] Request completed:', request.requestId);
          } catch (error) {
            updateRequestStatus(request.requestId, {
              status: 'FAILED',
              error: 'Failed to retrieve result',
            });
          }
        }

      } catch (error: any) {
        console.error('❌ [Queue] Error polling request:', request.requestId, error);
        updateRequestStatus(request.requestId, {
          status: 'FAILED',
          error: error.message,
        });
      }
    }
  }, [requests, checkStatus, getResult, updateRequestStatus]);

  // Start polling
  const startPolling = useCallback(() => {
    console.log('🔄 [Queue] startPolling called, isPolling:', isPolling);
    if (isPolling) {
      console.log('🔄 [Queue] Already polling, skipping');
      return;
    }

    setIsPolling(true);
    console.log('🔄 [Queue] Starting polling...');

    // Poll immediately
    pollStatus();

    // Then poll every 3 seconds
    pollingIntervalRef.current = setInterval(pollStatus, 3000);
    console.log('🔄 [Queue] Polling interval set:', pollingIntervalRef.current);
  }, [isPolling, pollStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    console.log('⏹️ [Queue] Stopped polling');
  }, []);

  // Remove a request from the queue
  const removeRequest = useCallback((requestId: string) => {
    setRequests(prev => prev.filter(req => req.requestId !== requestId));
  }, []);

  // Clear all completed requests
  const clearCompleted = useCallback(() => {
    setRequests(prev => prev.filter(req => 
      req.status !== 'COMPLETED' && req.status !== 'FAILED'
    ));
  }, []);

  // Get active requests count
  const getActiveCount = useCallback(() => {
    return requests.filter(req => 
      req.status === 'IN_QUEUE' || req.status === 'IN_PROGRESS'
    ).length;
  }, [requests]);

  return {
    requests,
    isPolling,
    submitRequest,
    checkStatus,
    getResult,
    cancelRequest,
    updateRequestStatus,
    removeRequest,
    clearCompleted,
    getActiveCount,
    startPolling,
    stopPolling,
  };
};
