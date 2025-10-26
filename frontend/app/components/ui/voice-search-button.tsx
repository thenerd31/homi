'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react';

/**
 * Voice Search Button - Vapi Integration
 *
 * Sponsor: Vapi
 *
 * Enables voice-based conversational search for vacation rentals
 * Uses Vapi Web SDK for real-time voice AI
 */

interface VoiceSearchButtonProps {
  onSearchComplete?: (params: any) => void;
  className?: string;
}

export default function VoiceSearchButton({ onSearchComplete, className = '' }: VoiceSearchButtonProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [vapi, setVapi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<string>('');

  // Initialize Vapi SDK
  useEffect(() => {
    // Load Vapi Web SDK
    const loadVapiSDK = async () => {
      try {
        // @ts-ignore - Vapi SDK loaded via script tag
        if (typeof window !== 'undefined' && window.Vapi) {
          // @ts-ignore
          const vapiInstance = new window.Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || 'demo-key');
          setVapi(vapiInstance);

          // Listen to call events
          vapiInstance.on('call-start', () => {
            console.log('Call started');
            setIsCallActive(true);
            setCallStatus('Connected - Speak now!');
          });

          vapiInstance.on('call-end', () => {
            console.log('Call ended');
            setIsCallActive(false);
            setCallStatus('');
          });

          vapiInstance.on('speech-start', () => {
            console.log('User started speaking');
            setCallStatus('Listening...');
          });

          vapiInstance.on('speech-end', () => {
            console.log('User stopped speaking');
            setCallStatus('Processing...');
          });

          vapiInstance.on('message', (message: any) => {
            console.log('Message from Vapi:', message);

            // If search is complete, extract parameters
            if (message.type === 'function-call' && message.functionCall?.name === 'search_rentals') {
              const params = message.functionCall.parameters;
              onSearchComplete?.(params);
            }
          });

          vapiInstance.on('error', (error: any) => {
            console.error('Vapi error:', error);
            setCallStatus('Error - Please try again');
            setIsCallActive(false);
          });
        }
      } catch (error) {
        console.error('Failed to initialize Vapi:', error);
      }
    };

    loadVapiSDK();
  }, [onSearchComplete]);

  const startCall = async () => {
    if (!vapi) {
      console.error('Vapi not initialized');
      return;
    }

    setIsLoading(true);
    setCallStatus('Connecting...');

    try {
      // Fetch assistant config from backend
      const response = await fetch('http://localhost:8000/api/vapi/assistant');
      const data = await response.json();

      if (data.success) {
        // Start call with assistant config
        await vapi.start(data.assistant);
      } else {
        // Fallback: Start with minimal config
        await vapi.start({
          name: 'Homi Assistant',
          firstMessage: 'Hi! Where would you like to stay?',
          model: {
            provider: 'anthropic',
            model: 'claude-sonnet-4-5-20250929',
            temperature: 0.7,
            messages: [{
              role: 'system',
              content: 'You are a friendly vacation rental assistant. Ask about location, dates, guests, and budget.'
            }]
          },
          voice: {
            provider: '11labs',
            voiceId: '21m00Tcm4TlvDq8ikWAM'
          }
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      setCallStatus('Failed to connect');
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapi && isCallActive) {
      vapi.stop();
      setIsCallActive(false);
      setCallStatus('');
    }
  };

  const toggleCall = () => {
    if (isCallActive) {
      endCall();
    } else {
      startCall();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleCall}
        disabled={isLoading}
        className={`
          relative group
          w-16 h-16 rounded-full
          flex items-center justify-center
          transition-all duration-300
          ${isCallActive
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 scale-110'
            : 'bg-stone-900 hover:bg-stone-800 shadow-lg hover:shadow-xl'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          disabled:opacity-50
        `}
        aria-label={isCallActive ? 'End voice search' : 'Start voice search'}
      >
        {/* Pulsing animation when active */}
        {isCallActive && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
        )}

        {/* Icon */}
        <div className="relative z-10">
          {isCallActive ? (
            <PhoneOff className="w-7 h-7 text-white" />
          ) : (
            <Mic className="w-7 h-7 text-white" />
          )}
        </div>
      </button>

      {/* Status text */}
      {callStatus && (
        <p className="text-sm text-stone-600 font-medium animate-pulse">
          {callStatus}
        </p>
      )}

      {/* Hint text */}
      {!isCallActive && !isLoading && (
        <p className="text-xs text-stone-500 text-center max-w-[200px]">
          Try voice search
        </p>
      )}
    </div>
  );
}
