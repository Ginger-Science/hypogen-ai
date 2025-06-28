
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export const useVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        console.log('Voice input:', transcript);
        
        if (transcript.toLowerCase().includes('generate hypothesis')) {
          toast({
            title: "🎤 Voice Command Detected",
            description: "Processing hypothesis generation request...",
          });
          
          // Trigger hypothesis generation
          const customEvent = new CustomEvent('voiceHypothesisRequest', { 
            detail: { transcript } 
          });
          window.dispatchEvent(customEvent);
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [toast]);

  const startListening = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
      toast({
        title: "🎤 Voice Assistant Active",
        description: "Say 'Generate hypothesis about...' to start",
      });
    } else {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: !!recognition
  };
};
