'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Mic } from 'lucide-react';
import { api, ConversationMessage } from '../../../lib/api';

export default function VoiceInputPage() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [extractedParams, setExtractedParams] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Process audio when recording stops
  useEffect(() => {
    if (audioBlob && !isRecording) {
      processAudio();
    }
  }, [audioBlob, isRecording]);

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);

    try {
      // Step 1: Transcribe audio to text
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const transcriptionResult = await api.voiceToText(audioFile);

      if (transcriptionResult.success && transcriptionResult.text) {
        const userMessage = transcriptionResult.text;
        setTranscribedText(userMessage);

        // Add user message to conversation
        const updatedHistory: ConversationMessage[] = [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ];
        setConversationHistory(updatedHistory);

        // Step 2: Call conversational search with transcribed text
        const response = await api.conversationSearch({
          user_message: userMessage,
          user_id: userId,
          conversation_history: conversationHistory,
          extracted_so_far: extractedParams
        });

        // Add assistant response to conversation
        setConversationHistory([
          ...updatedHistory,
          { role: 'assistant', content: response.message }
        ]);

        // Update extracted params
        setExtractedParams(response.extracted_params);

        // If ready to search, execute the search
        if (response.status === 'ready_to_search') {
          const searchResult = await api.executeSearch({
            extracted_params: response.extracted_params,
            user_id: userId
          });

          console.log('Search complete:', searchResult);
          // Navigate to swipe page
          router.push('/discover/swipe');
        }
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      setConversationHistory([
        ...conversationHistory,
        { role: 'assistant', content: 'Sorry, I had trouble understanding that. Please try again.' }
      ]);
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };

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
            <div className="w-0.5 h-3 bg-white rounded-full"></div>
            <div className="w-0.5 h-4 bg-white rounded-full"></div>
            <div className="w-0.5 h-5 bg-white rounded-full"></div>
            <div className="w-0.5 h-4 bg-white rounded-full"></div>
            <div className="w-0.5 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-white text-lg font-medium">Transcribe</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="flex-1 px-6 pt-4 pb-32 overflow-y-auto">
            <div className="space-y-4">
              {conversationHistory.map((msg, idx) => (
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

        {/* Gradient background for initial state */}
        {conversationHistory.length === 0 && (
          <>
            <div
              className={`absolute inset-0 transition-opacity duration-300 ${
                isRecording ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                background: 'radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0) 60%)',
              }}
            />
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-white/20 animate-ping"></div>
              </div>
            )}
          </>
        )}

        {/* Microphone Button */}
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-10">
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110'
                : isProcessing
                ? 'bg-white/10 cursor-not-allowed opacity-50'
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30'
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic className={`w-10 h-10 ${isRecording ? 'text-white' : 'text-white'}`} strokeWidth={2} />
          </button>

          {/* Status text */}
          {isRecording && (
            <p className="text-white text-sm text-center mt-4 animate-pulse">
              Recording...
            </p>
          )}
          {isProcessing && (
            <p className="text-white text-sm text-center mt-4">
              Processing...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
