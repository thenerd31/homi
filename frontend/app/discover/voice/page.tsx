'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic } from 'lucide-react';
import Vapi from '@vapi-ai/web';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function VoiceInputPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [extractedParams, setExtractedParams] = useState<any>({});
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      const existingUserId = localStorage.getItem('vibe_user_id');
      if (existingUserId) return existingUserId;
      const newUserId = 'demo-user-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('vibe_user_id', newUserId);
      return newUserId;
    }
    return 'demo-user-' + Math.random().toString(36).substr(2, 9);
  });

  const vapiRef = useRef<Vapi | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const [vapiPublicKey, setVapiPublicKey] = useState<string>('');

  // Get Vapi public key on mount
  useEffect(() => {
    const getKey = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/vapi/public-key');
        const data = await response.json();
        if (data.success && data.public_key) {
          setVapiPublicKey(data.public_key);
          vapiRef.current = new Vapi(data.public_key);
        }
      } catch (error) {
        console.error('Error getting Vapi key:', error);
      }
    };
    getKey();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await processRecording();
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('Recording stopped');

      // Stop all tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);

    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('Audio blob size:', audioBlob.size);

      // Send to backend for transcription
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      const transcriptResponse = await fetch('http://localhost:8000/api/voice-to-text', {
        method: 'POST',
        body: formData,
      });

      const transcriptData = await transcriptResponse.json();
      const userText = transcriptData.text || 'Could not transcribe';

      console.log('Transcribed:', userText);

      // Add user message to conversation history for API
      const newHistory = [
        ...conversationHistory,
        { role: 'user', content: userText }
      ];

      // Add user message to UI conversation
      setConversation(prev => [...prev, { role: 'user', content: userText }]);

      // Get AI response from conversational search with full context
      const searchResponse = await fetch('http://localhost:8000/api/search/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          user_message: userText,
          conversation_history: newHistory,
          extracted_so_far: extractedParams,
        }),
      });

      const searchData = await searchResponse.json();
      const aiText = searchData.message || 'I understand.';
      const searchComplete = searchData.status === 'ready_to_search';

      console.log('AI response:', aiText);
      console.log('Extracted params:', searchData.extracted_params);
      console.log('Status:', searchData.status);
      console.log('Missing params:', searchData.missing_params);
      console.log('Search complete:', searchComplete);

      // Update conversation history
      const updatedHistory = [
        ...newHistory,
        { role: 'assistant', content: aiText }
      ];
      setConversationHistory(updatedHistory);

      // Update extracted parameters
      if (searchData.extracted_params) {
        setExtractedParams(searchData.extracted_params);
      }

      // Add AI message to UI conversation
      setConversation(prev => [...prev, { role: 'assistant', content: aiText }]);

      // Speak the response using Vapi
      await speakResponse(aiText);

      // Check if search is complete
      if (searchComplete && searchData.extracted_params) {
        console.log('Search complete! Navigating to results...');
        setTimeout(() => {
          router.push('/discover/swipe');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = async (text: string) => {
    if (!vapiRef.current) {
      console.log('Vapi not initialized, skipping speech');
      return;
    }

    try {
      // Get assistant config
      const response = await fetch('http://localhost:8000/api/vapi/assistant');
      const data = await response.json();

      if (data.success && data.assistant) {
        // Modify assistant to speak our text
        const speakConfig = {
          ...data.assistant,
          firstMessage: text,
          model: {
            ...data.assistant.model,
            messages: [
              {
                role: 'system',
                content: 'You are a helpful assistant. Say the exact message provided and then immediately end the call.'
              }
            ]
          },
          // Remove serverUrl for local development (Vapi requires HTTPS)
          serverUrl: undefined,
          serverMessages: undefined
        };

        // Start call to speak
        console.log('Starting Vapi call with config:', JSON.stringify(speakConfig, null, 2));
        await vapiRef.current.start(speakConfig);
        console.log('Vapi speaking:', text);

        // Stop call after speaking
        vapiRef.current.on('speech-end', () => {
          setTimeout(() => {
            if (vapiRef.current) {
              vapiRef.current.stop();
              console.log('Vapi call stopped');
            }
          }, 500);
        });
      }
    } catch (error) {
      console.error('Error speaking with Vapi:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  // Show and speak initial greeting using Vapi
  useEffect(() => {
    if (conversation.length === 0 && vapiPublicKey) {
      const greeting = "Hi! Click the microphone to tell me about your ideal vacation rental.";
      setConversation([{
        role: 'assistant',
        content: greeting
      }]);

      // Give Vapi a moment to initialize, then speak
      setTimeout(() => {
        console.log('Attempting to speak greeting...');
        console.log('Vapi ref exists:', !!vapiRef.current);
        if (vapiRef.current) {
          speakResponse(greeting);
        } else {
          console.error('Vapi not initialized yet');
        }
      }, 1000);
    }
  }, [vapiPublicKey]); // Trigger when Vapi is initialized

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
        <button
          onClick={() => router.back()}
          className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[3, 4, 5, 4, 3].map((height, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  isRecording ? 'bg-red-400 animate-pulse' : 'bg-white'
                }`}
                style={{ height: `${height * 4}px` }}
              />
            ))}
          </div>
          <span className="text-white text-lg font-medium">
            Push to Talk
          </span>
        </div>
      </div>

      <p className="text-center text-white/70 text-sm mt-1 font-hind">
        {isRecording
          ? 'Speak now, then release to send'
          : isProcessing
          ? 'Processing your message...'
          : 'Press and hold to speak'
        }
      </p>

      <div className="flex-1 flex flex-col relative">
        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="flex-1 px-6 pt-4 pb-32 overflow-y-auto">
            <div className="space-y-4">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-white/90'
                    }`}
                  >
                    <p className="text-base">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-white/90 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Microphone Button */}
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                : isProcessing
                ? 'bg-white/10 cursor-not-allowed opacity-50'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic className="w-10 h-10 text-white" strokeWidth={2} />
          </button>

          {/* Status text */}
          {isRecording && (
            <p className="text-white text-sm text-center mt-4 animate-pulse">
              Recording...
            </p>
          )}
          {isProcessing && (
            <p className="text-white/60 text-sm text-center mt-4">
              Processing...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
