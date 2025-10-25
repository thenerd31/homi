"""
Manual Voice-to-Text Test
Upload your own audio file to test transcription
"""

import sys
import httpx
from pathlib import Path

def test_voice_to_text(audio_file_path: str):
    """
    Test voice-to-text endpoint with your audio file

    Usage:
        python test_voice_manual.py /path/to/your/audio.mp3
    """

    audio_path = Path(audio_file_path)

    if not audio_path.exists():
        print(f"❌ Error: File not found: {audio_file_path}")
        print("\nUsage: python test_voice_manual.py /path/to/audio.mp3")
        return

    print(f"📁 Loading audio file: {audio_path.name}")
    print(f"📏 File size: {audio_path.stat().st_size / 1024:.1f} KB\n")

    # Read the audio file
    with open(audio_path, 'rb') as f:
        audio_data = f.read()

    print("🚀 Uploading to API...")

    # Send to API
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                "http://localhost:8000/api/voice-to-text",
                files={"audio_file": (audio_path.name, audio_data, "audio/mpeg")}
            )

            if response.status_code == 200:
                result = response.json()
                print("✅ Success!\n")
                print("📝 Transcription:")
                print(f"   {result['text']}\n")
                print("💡 Tip: You can now use this text in conversational search:")
                print(f'   curl -X POST http://localhost:8000/api/search/conversation \\')
                print(f'     -H "Content-Type: application/json" \\')
                print(f'     -d \'{{ "user_message": "{result["text"]}" }}\'')

            elif response.status_code == 501:
                print("⚠️  Vapi API not configured")
                print("   Add VAPI_API_KEY to your .env file to enable voice transcription")
                print(f"\n   Error: {response.json()['detail']}")

            else:
                print(f"❌ Error: {response.status_code}")
                print(f"   {response.text}")

    except httpx.ReadTimeout:
        print("❌ Request timed out - file might be too large or API is slow")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_voice_manual.py /path/to/audio.mp3\n")
        print("Supported formats: MP3, WAV, M4A, OGG")
        print("\nExamples:")
        print("  python test_voice_manual.py ~/Desktop/voice_memo.mp3")
        print("  python test_voice_manual.py recording.wav")
        sys.exit(1)

    audio_file = sys.argv[1]
    test_voice_to_text(audio_file)
