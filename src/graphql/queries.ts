
import { gql } from '@apollo/client';

export const GET_REAL_TIME_ANALYTICS = gql`
  query GetRealTimeAnalytics($userId: String!) {
    analytics(userId: $userId) {
      impactScore
      confidenceScore
      velocityScore
      reputationTokens
      collaborationCount
      publishedHypotheses
      citationCount
      lastUpdated
    }
  }
`;

export const PUBLISH_TO_BLOCKCHAIN = gql`
  mutation PublishToBlockchain($hypothesisId: String!, $metadata: JSON!, $waitForConfirmation: Boolean = true) {
    publishToBlockchain(hypothesisId: $hypothesisId, metadata: $metadata, waitForConfirmation: $waitForConfirmation) {
      success
      transactionHash
      ipfsHash
      contractAddress
      nftTokenId
      gasUsed
      blockNumber
      confirmationCount
      status
      error
    }
  }
`;

export const GET_COLLABORATION_SESSION = gql`
  query GetCollaborationSession($hypothesisId: String!) {
    collaborationSession(hypothesisId: $hypothesisId) {
      id
      participants {
        id
        name
        role
        isOnline
        lastSeen
        avatar
      }
      messages {
        id
        userId
        userName
        content
        timestamp
        type
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const GET_COLLABORATORS = gql`
  query GetCollaborators($hypothesisId: String!) {
    collaborators(hypothesisId: $hypothesisId) {
      id
      name
      role
      isOnline
      lastSeen
      avatar
      status
    }
  }
`;

export const CREATE_COLLABORATION_SESSION = gql`
  mutation CreateCollaborationSession($hypothesisId: String!) {
    createCollaborationSession(hypothesisId: $hypothesisId) {
      success
      sessionId
      websocketUrl
      error
    }
  }
`;

export const JOIN_COLLABORATION = gql`
  mutation JoinCollaboration($hypothesisId: String!, $userId: String!, $userName: String!) {
    joinCollaboration(hypothesisId: $hypothesisId, userId: $userId, userName: $userName) {
      success
      sessionId
      error
    }
  }
`;

export const SEND_COLLABORATION_MESSAGE = gql`
  mutation SendCollaborationMessage($sessionId: String!, $userId: String!, $userName: String!, $content: String!, $type: String = "text") {
    sendCollaborationMessage(sessionId: $sessionId, userId: $userId, userName: $userName, content: $content, type: $type) {
      success
      messageId
      error
    }
  }
`;

export const PROCESS_VOICE_COMMAND = gql`
  mutation ProcessVoiceCommand($command: String!, $userId: String!, $context: JSON) {
    processVoiceCommand(command: $command, userId: $userId, context: $context) {
      success
      action
      parameters
      response
      hypothesisGenerated
      error
    }
  }
`;

export const GET_RESEARCH_SUGGESTIONS = gql`
  query GetResearchSuggestions($topic: String!, $limit: Int = 5) {
    researchSuggestions(topic: $topic, limit: $limit) {
      suggestions
      relatedTopics
      keywordTrends
      citationOpportunities
    }
  }
`;
