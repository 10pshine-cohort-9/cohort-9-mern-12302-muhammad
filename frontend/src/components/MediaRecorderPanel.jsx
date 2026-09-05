import React, { useState, useRef, useEffect } from 'react';
import { Mic, Video, Square, Trash2, ShieldAlert, RotateCcw } from 'lucide-react';
import useAuthenticatedMedia from '../hooks/useAuthenticatedMedia';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const MediaRecorderPanel = ({ mode, existingMediaUrl, onMediaChange }) => {
  const [permissionState, setPermissionState] = useState('idle'); // idle | requesting | granted | denied
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const liveVideoRef = useRef(null);

  const isVideo = mode === 'video';
  const resolvedExistingUrl = useAuthenticatedMedia(existingMediaUrl);

  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const requestPermissionAndStart = async () => {
    setError(null);
    setPermissionState('requesting');
    try {
      const constraints = isVideo
        ? { video: true, audio: true }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermissionState('granted');

      const mimeType = isVideo
        ? (window.MediaRecorder?.isTypeSupported('video/webm') ? 'video/webm' : '')
        : (window.MediaRecorder?.isTypeSupported('audio/webm') ? 'audio/webm' : '');

      const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || (isVideo ? 'video/webm' : 'audio/webm') });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onMediaChange(blob);
        stopStream();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    } catch (err) {
      console.error('Permission/recording error:', err);
      setPermissionState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(`${isVideo ? 'Camera and microphone' : 'Microphone'} permission was denied. Please allow access in your browser settings to record.`);
      } else if (err.name === 'NotFoundError') {
        setError(`No ${isVideo ? 'camera/microphone' : 'microphone'} device was found on this system.`);
      } else {
        setError('Unable to start recording. Please check your device permissions and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const discardRecording = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setElapsed(0);
    setPermissionState('idle');
    onMediaChange(null, previewUrl ? 'keep' : (existingMediaUrl ? 'remove' : 'keep'));
  };

  const attachLiveVideo = (node) => {
    liveVideoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.muted = true;
      node.play().catch(() => {});
    }
  };

  const hasPreview = previewUrl || existingMediaUrl;

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl text-sm">
          <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isVideo && isRecording && (
        <video ref={attachLiveVideo} className="w-full rounded-xl bg-black max-h-64 object-contain" />
      )}

      {!isRecording && hasPreview && (
        isVideo ? (
          <video src={previewUrl || resolvedExistingUrl} controls className="w-full rounded-xl bg-black max-h-64" />
        ) : (
          <audio src={previewUrl || resolvedExistingUrl} controls className="w-full" />
        )
      )}

      <div className="flex items-center gap-3">
        {!isRecording && !previewUrl && (
          <button
            type="button"
            onClick={requestPermissionAndStart}
            disabled={permissionState === 'requesting'}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold disabled:opacity-50"
          >
            {isVideo ? <Video className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {permissionState === 'requesting'
              ? 'Requesting permission...'
              : hasPreview
                ? `Re-record ${isVideo ? 'Video' : 'Voice'}`
                : `Start ${isVideo ? 'Video' : 'Voice'} Recording`}
          </button>
        )}

        {isRecording && (
          <>
            <button
              type="button"
              onClick={stopRecording}
              className="flex items-center px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-semibold"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </button>
            <span className="flex items-center text-sm font-mono text-gray-500 dark:text-gray-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-2" />
              {formatTime(elapsed)}
            </span>
          </>
        )}

        {!isRecording && hasPreview && (
          <button
            type="button"
            onClick={discardRecording}
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </button>
        )}

        {!isRecording && hasPreview && (
          <button
            type="button"
            onClick={requestPermissionAndStart}
            className="flex items-center px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Re-record
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        {isVideo
          ? "You'll be asked to allow camera and microphone access to record a video note."
          : "You'll be asked to allow microphone access to record a voice note."}
      </p>
    </div>
  );
};

export default MediaRecorderPanel;
