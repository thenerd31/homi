'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, Send, Mic } from 'lucide-react';
import { api, ConversationMessage } from '../../../lib/api';

export default function TextInputPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [extractedParams, setExtractedParams] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState('demo-user-' + Math.random().toString(36).substr(2, 9));
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText('');
    setIsLoading(true);

    // Add user message to conversation
    const updatedHistory: ConversationMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];
    setConversationHistory(updatedHistory);

    try {
      // Call conversational search API
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
        // Navigate to swipe page (or results page)
        router.push('/discover/swipe');
      }
    } catch (error) {
      console.error('Conversation error:', error);
      // For now, just navigate to swipe page even if API fails (for UI testing)
      console.log('Skipping API error, navigating to swipe page for UI testing');
      router.push('/discover/swipe');
    } finally {
      setIsLoading(false);
    }
  };

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

    setIsLoading(true);

    try {
      // Step 1: Transcribe audio to text
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      const transcriptionResult = await api.voiceToText(audioFile);

      if (transcriptionResult.success && transcriptionResult.text) {
        const userMessage = transcriptionResult.text;
        setInputText(userMessage);

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
      setIsLoading(false);
      setAudioBlob(null);
      setInputText('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-4 pb-2 relative">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Go back"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <span className="text-white text-lg font-medium">Type</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pt-4 pb-24 overflow-y-auto">
        {conversationHistory.length === 0 ? (
          <div>
            <p className="text-white/60 text-base mb-3">
              What kind of place feels right for you?
            </p>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Think: San Francisco, city loft, seaside studio..."
              className="w-full bg-transparent text-white text-2xl font-light resize-none outline-none placeholder:text-white/30 min-h-[200px]"
              autoFocus
            />
          </div>
        ) : (
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
            {isLoading && (
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
        )}
      </div>

      {/* Input Box (fixed at bottom) */}
      {conversationHistory.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-white/10 px-6 py-4">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 text-white px-4 py-3 rounded-full outline-none placeholder:text-white/40"
              disabled={isLoading || isRecording}
              autoFocus
            />
            <button
              type="button"
              onClick={handleMicClick}
              disabled={isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-white/20 hover:bg-white/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputText.trim() || isLoading || isRecording}
              className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all"
              aria-label="Send"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Submit Button (only for first message) */}
      {conversationHistory.length === 0 && inputText.trim() && (
        <div className="fixed bottom-24 right-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 backdrop-blur-sm flex items-center justify-center transition-all shadow-lg"
            aria-label="Submit"
          >
            <Check className="w-7 h-7 text-white" strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
}
