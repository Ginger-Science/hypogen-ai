
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_COLLABORATORS, CREATE_COLLABORATION_SESSION } from '@/graphql/queries';

interface CollaborationState {
  collaborators: any[];
  isConnected: boolean;
  messages: any[];
  currentSession: string | null;
}

export const useRealTimeCollaboration = (hypothesisId: string) => {
  const [state, setState] = useState<CollaborationState>({
    collaborators: [],
    isConnected: false,
    messages: [],
    currentSession: null
  });
  
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  const { data: collaboratorsData, refetch } = useQuery(GET_COLLABORATORS, {
    variables: { hypothesisId },
    pollInterval: 5000, // Poll every 5 seconds for real-time updates
  });

  const [createSession] = useMutation(CREATE_COLLABORATION_SESSION);

  const connectToCollaboration = useCallback(async () => {
    try {
      const { data } = await createSession({ variables: { hypothesisId } });
      const { sessionId, websocketUrl } = data.createCollaborationSession;
      
      const ws = new WebSocket(websocketUrl);
      
      ws.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, currentSession: sessionId }));
        ws.send(JSON.stringify({ type: 'join', sessionId, hypothesisId }));
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));
      };
      
      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
      };
      
      setWebsocket(ws);
    } catch (error) {
      console.error('Failed to connect to collaboration session:', error);
    }
  }, [hypothesisId, createSession]);

  const sendMessage = useCallback((message: string) => {
    if (websocket && state.isConnected) {
      websocket.send(JSON.stringify({
        type: 'message',
        content: message,
        timestamp: new Date().toISOString(),
        user: 'current-user'
      }));
    }
  }, [websocket, state.isConnected]);

  useEffect(() => {
    if (collaboratorsData) {
      setState(prev => ({
        ...prev,
        collaborators: collaboratorsData.collaborators
      }));
    }
  }, [collaboratorsData]);

  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  return {
    ...state,
    connectToCollaboration,
    sendMessage,
    refetchCollaborators: refetch
  };
};
