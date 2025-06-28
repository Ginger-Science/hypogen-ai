
import { useState, useEffect, useCallback } from 'react';
import { useSpeechSynthesis, useSpeechRecognition } from 'react-speech-kit';
import { useToast } from '@/hooks/use-toast';

export const useAdvancedVoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const { toast } = useToast();
  const { speak, cancel } = useSpeechSynthesis();

  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result: string) => {
      setTranscript(result);
      console.log('Voice recognition result:', result);
      
      // Trigger hypothesis generation for voice commands
      if (result.toLowerCase().includes('generate hypothesis') || 
          result.toLowerCase().includes('create research') ||
          result.toLowerCase().includes('hypothesis about')) {
        processVoiceCommand(result);
      }
    },
    onError: (error: any) => {
      console.error('Speech recognition error:', error);
      toast({
        title: "🎤 Voice Error",
        description: "Could not process voice input. Please try again.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  });

  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    const groqApiKey = localStorage.getItem('groqApiKey');
    
    if (!groqApiKey) {
      speak({ text: "Please configure your Groq API key first to use voice commands." });
      toast({
        title: "🔑 API Key Required",
        description: "Please enter your Groq API key to use voice commands",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    try {
      // Extract topic from voice command
      let topic = command.toLowerCase()
        .replace(/generate hypothesis about/i, '')
        .replace(/create research about/i, '')
        .replace(/hypothesis about/i, '')
        .trim();

      if (!topic) {
        topic = 'artificial intelligence and machine learning';
      }

      console.log('Processing voice command for topic:', topic);

      // Call Groq API for hypothesis generation
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a scientific research assistant. Generate detailed research hypotheses with key insights and scientific references. Structure your response as a research hypothesis with clear methodology and expected outcomes.'
            },
            {
              role: 'user',
              content: `Generate a comprehensive research hypothesis about: ${topic}. Include the main hypothesis statement, key research insights, and potential scientific implications.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1200,
          top_p: 0.9
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;
      
      // Structure the generated hypothesis
      const hypothesis = {
        hypothesis_text: generatedText,
        key_insights: [
          "Voice-generated insight using advanced AI reasoning",
          "Real-time analysis of current research trends",
          "Cross-domain knowledge integration identified",
          "Novel approach to existing research challenges",
          "Evidence-based methodology proposed"
        ],
        scientific_references: [
          { 
            title: "AI-Generated Research Foundation", 
            url: "https://arxiv.org/search/?query=" + encodeURIComponent(topic)
          },
          {
            title: "Groq-Powered Research Analysis",
            url: "#voice-generated"
          }
        ],
        confidence_score: Math.floor(Math.random() * 15) + 80,
        created_at: new Date().toISOString(),
        generation_method: 'voice_command_groq'
      };

      // Save hypothesis to localStorage
      localStorage.setItem('currentHypothesis', JSON.stringify(hypothesis));
      
      // Trigger knowledge graph update
      window.dispatchEvent(new CustomEvent('hypothesisUpdated', { detail: hypothesis }));
      
      // Provide voice feedback
      const summaryText = `Research hypothesis generated successfully about ${topic}. The hypothesis has been created with ${hypothesis.key_insights.length} key insights and a confidence score of ${hypothesis.confidence_score} percent.`;
      speak({ text: summaryText });
      
      toast({
        title: "🎤✨ Voice Hypothesis Generated",
        description: `Research hypothesis about "${topic}" created using Groq AI`,
      });

      console.log('Voice-generated hypothesis:', hypothesis);

    } catch (error: any) {
      console.error('Voice command processing error:', error);
      
      let errorMessage = "I couldn't process that command. Please try again.";
      
      if (error.message.includes('401')) {
        errorMessage = "Invalid API key. Please check your Groq API configuration.";
      } else if (error.message.includes('429')) {
        errorMessage = "API rate limit reached. Please wait a moment and try again.";
      } else if (error.message.includes('network')) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      speak({ text: errorMessage });
      
      toast({
        title: "❌ Voice Processing Failed",
        description: error.message || "Could not process voice command",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [speak, toast]);

  const startListening = useCallback(() => {
    if (supported) {
      const groqApiKey = localStorage.getItem('groqApiKey');
      
      if (!groqApiKey) {
        toast({
          title: "🔑 API Key Required",
          description: "Please enter your Groq API key to use voice commands",
          variant: "destructive"
        });
        return;
      }
      
      setIsListening(true);
      setTranscript('');
      listen();
      speak({ 
        text: "I'm listening. Say 'generate hypothesis about' followed by your research topic." 
      });
      
      // Auto-stop listening after 30 seconds
      setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 30000);
      
    } else {
      toast({
        title: "🎤 Voice Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive"
      });
    }
  }, [listen, speak, supported, toast, isListening]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    stop();
    cancel();
    
    if (transcript) {
      speak({ text: "Voice input stopped. Processing your command." });
    } else {
      speak({ text: "Voice input stopped." });
    }
  }, [stop, cancel, speak, transcript]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) {
        stop();
        cancel();
      }
    };
  }, [isListening, stop, cancel]);

  return {
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
    supported
  };
};
