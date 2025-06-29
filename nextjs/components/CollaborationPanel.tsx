
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageCircle, Video, Share2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  role: string;
  joinedAt: string;
}

export const CollaborationPanel = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      avatar: 'SJ',
      status: 'online',
      role: 'Lead Researcher',
      joinedAt: '2 min ago'
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      avatar: 'MC',
      status: 'away',
      role: 'Data Scientist',
      joinedAt: '5 min ago'
    },
    {
      id: '3',
      name: 'Dr. Emma Wilson',
      avatar: 'EW',
      status: 'online',
      role: 'Research Assistant',
      joinedAt: '10 min ago'
    }
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, user: 'Dr. Sarah Johnson', message: 'The hypothesis looks promising!', time: '2 min ago' },
    { id: 2, user: 'Prof. Michael Chen', message: 'I agree, let\'s add more data points', time: '3 min ago' }
  ]);
  
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const inviteCollaborator = () => {
    if (inviteEmail.trim()) {
      const newCollaborator: Collaborator = {
        id: Date.now().toString(),
        name: inviteEmail.split('@')[0],
        avatar: inviteEmail.substring(0, 2).toUpperCase(),
        status: 'online',
        role: 'Collaborator',
        joinedAt: 'just now'
      };
      
      setCollaborators(prev => [...prev, newCollaborator]);
      setInviteEmail('');
      
      toast({
        title: "🤝 Invitation Sent",
        description: `Invited ${inviteEmail} to collaborate`,
      });
    }
  };

  const startVideoCall = () => {
    toast({
      title: "📹 Starting Video Call",
      description: "Connecting with research team...",
    });
  };

  const shareHypothesis = () => {
    toast({
      title: "🔗 Hypothesis Shared",
      description: "Link copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Active Collaborators */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Users className="h-5 w-5" />
            Active Collaborators ({collaborators.length})
          </CardTitle>
          <CardDescription className="text-blue-600 dark:text-blue-400">
            Real-time research collaboration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div key={collaborator.id} className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {collaborator.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800 dark:text-blue-200">{collaborator.name}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{collaborator.role} • {collaborator.joinedAt}</p>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={
                    collaborator.status === 'online' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : collaborator.status === 'away'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }
                >
                  {collaborator.status}
                </Badge>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={startVideoCall}
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button 
              onClick={shareHypothesis}
              size="sm" 
              variant="outline"
              className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invite New Collaborator */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <UserPlus className="h-5 w-5" />
            Invite Collaborator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="border-green-300 focus:border-green-500"
            />
            <Button 
              onClick={inviteCollaborator}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Chat */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
            <MessageCircle className="h-5 w-5" />
            Research Discussion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className="p-2 bg-white/60 dark:bg-gray-800/60 rounded">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm text-purple-800 dark:text-purple-200">{message.user}</p>
                  <span className="text-xs text-purple-600 dark:text-purple-400">{message.time}</span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">{message.message}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Type your message..."
              className="border-purple-300 focus:border-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const newMessage = {
                    id: Date.now(),
                    user: 'You',
                    message: (e.target as HTMLInputElement).value,
                    time: 'now'
                  };
                  setMessages(prev => [...prev, newMessage]);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <Button 
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
