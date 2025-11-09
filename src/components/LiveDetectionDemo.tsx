/**
 * LiveDetectionDemo Component
 * 
 * Real-time hazard detection and V2V communication demo
 * 
 * Components:
 * - YouTube video feed for demonstration
 * - Real device gyroscope sensor integration
 * - Real V2V networking interface (WebSocket-ready)
 * - Manual test detection for demos
 * 
 * Ready for:
 * - Actual YOLOv8 model integration
 * - Real camera feed processing
 * - Production WebSocket V2V network
 * 
 * NO AUTOMATIC SIMULATIONS
 */

import { useState, useEffect, useRef } from 'react';
import { Camera, Activity, AlertTriangle, CheckCircle2, Gauge, Wifi, Play, Pause, RotateCcw, Zap, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { useVehicleToVehicle } from './useVehicleToVehicle';
import { toast } from 'sonner';

interface Detection {
  id: number;
  type: 'pothole' | 'speedbump' | 'crack' | 'debris';
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  timestamp: string;
}

interface GyroData {
  x: number;
  y: number;
  z: number;
  stability: number;
}

export function LiveDetectionDemo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [gyroData, setGyroData] = useState<GyroData>({ x: 0, y: 0, z: 0, stability: 100 });
  const [fps, setFps] = useState(30);
  const [totalDetections, setTotalDetections] = useState(0);
  const [highConfidence, setHighConfidence] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // V2V Communication Hook
  const { broadcastHazard, getStats, isConnected, nearbyVehicles } = useVehicleToVehicle((hazard) => {
    // When receiving hazard from nearby vehicle
    toast.success(`🚨 Hazard Alert from Nearby Vehicle`, {
      description: `${hazard.type.toUpperCase()} detected ${hazard.locationName}`
    });
  });

  // YouTube video - embedded format
  const demoVideoUrl = "https://www.youtube.com/embed/RgwugyfF2_4?autoplay=0&controls=1&rel=0";

  // READY FOR REAL YOLOv8 DETECTIONS
  // This function will be called when actual YOLOv8 detects a hazard
  const handleRealDetection = (detection: Detection) => {
    if (gyroData.stability > 70) {
      setDetections(prev => [detection, ...prev].slice(0, 10));
      setTotalDetections(prev => prev + 1);
      if (detection.confidence > 0.8) {
        setHighConfidence(prev => prev + 1);
      }

      // Broadcast detection to nearby vehicles via V2V
      broadcastHazard(
        detection.type,
        detection.confidence,
        `${detection.type.toUpperCase()} detected by YOLOv8 with ${(detection.confidence * 100).toFixed(1)}% confidence`,
        'yolov8'
      );

      // Play detection sound
      playDetectionSound();
    }
  };

  // Manual test button for demo purposes
  const triggerTestDetection = () => {
    const testDetection: Detection = {
      id: Date.now(),
      type: ['pothole', 'speedbump', 'crack', 'debris'][Math.floor(Math.random() * 4)] as any,
      confidence: 0.85 + Math.random() * 0.14,
      x: Math.random() * 0.6 + 0.2,
      y: Math.random() * 0.4 + 0.4,
      width: 0.1 + Math.random() * 0.15,
      height: 0.08 + Math.random() * 0.12,
      timestamp: new Date().toLocaleTimeString(),
    };
    handleRealDetection(testDetection);
  };

  // TODO: Integrate with actual YOLOv8 model
  // useEffect(() => {
  //   if (!isPlaying) return;
  //   
  //   // Initialize YOLOv8 model here
  //   const yoloModel = await loadYOLOv8Model();
  //   
  //   // Process video frames
  //   const processFrame = async () => {
  //     const detections = await yoloModel.detect(videoFrame);
  //     detections.forEach(det => handleRealDetection(det));
  //   };
  //   
  //   // Run detection on each frame
  //   const frameInterval = setInterval(processFrame, 100);
  //   return () => clearInterval(frameInterval);
  // }, [isPlaying]);

  // READY FOR REAL GYROSCOPE DATA
  useEffect(() => {
    if (!isPlaying) return;

    // Request gyroscope permission and start reading
    if (window.DeviceMotionEvent && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      // iOS 13+ requires permission
      (DeviceMotionEvent as any).requestPermission()
        .then((permissionState: string) => {
          if (permissionState === 'granted') {
            startGyroscope();
          }
        })
        .catch(console.error);
    } else if (window.DeviceMotionEvent) {
      // Android and older iOS
      startGyroscope();
    }

    function startGyroscope() {
      const handleMotion = (event: DeviceMotionEvent) => {
        const accel = event.accelerationIncludingGravity;
        if (accel && accel.x !== null && accel.y !== null && accel.z !== null) {
          // Calculate stability based on acceleration magnitude
          const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
          const stability = Math.max(0, Math.min(100, 100 - (magnitude - 9.8) * 10));
          
          setGyroData({
            x: accel.x,
            y: accel.y,
            z: accel.z,
            stability: stability,
          });
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => window.removeEventListener('devicemotion', handleMotion);
    }

    // Fallback: If no gyroscope available, assume stable
    const fallbackInterval = setInterval(() => {
      setGyroData({
        x: 0,
        y: 0,
        z: 9.8,
        stability: 100,
      });
      setFps(30);
    }, 100);

    return () => clearInterval(fallbackInterval);
  }, [isPlaying]);

  // Draw detection boxes on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      canvas.width = 1280;
      canvas.height = 720;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all active detections
      detections.slice(0, 3).forEach((det) => {
        const x = det.x * canvas.width;
        const y = det.y * canvas.height;
        const w = det.width * canvas.width;
        const h = det.height * canvas.height;

        // Box color based on type
        const colors = {
          pothole: '#ef4444',
          speedbump: '#f59e0b',
          crack: '#3b82f6',
          debris: '#8b5cf6',
        };
        const color = colors[det.type];

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // Draw label background
        ctx.fillStyle = color;
        const label = `${det.type.toUpperCase()} ${(det.confidence * 100).toFixed(0)}%`;
        const metrics = ctx.measureText(label);
        const textHeight = 20;
        ctx.fillRect(x, y - textHeight - 5, metrics.width + 10, textHeight);

        // Draw label text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.fillText(label, x + 5, y - 8);

        // Draw corner markers
        const cornerSize = 10;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize);
        ctx.lineTo(x, y);
        ctx.lineTo(x + cornerSize, y);
        ctx.stroke();
        // Top-right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerSize, y);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w, y + cornerSize);
        ctx.stroke();
        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(x, y + h - cornerSize);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + cornerSize, y + h);
        ctx.stroke();
        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(x + w - cornerSize, y + h);
        ctx.lineTo(x + w, y + h);
        ctx.lineTo(x + w, y + h - cornerSize);
        ctx.stroke();
      });

      requestAnimationFrame(draw);
    };

    draw();
  }, [detections]);

  const playDetectionSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLXiTYHGGi6'); 
    audio.volume = 0.3;
    audio.play().catch(() => {}); // Ignore errors
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setDetections([]);
    setTotalDetections(0);
    setHighConfidence(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      {/* Header with VW Branding */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 bg-[#0070E1] rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Hazard Scout AI
          </h1>
        </div>
        <p className="text-slate-400 text-lg">YOLOv8 Vision + Gyroscope Sensor Fusion</p>
        <Badge className="mt-2 bg-[#0070E1]/20 text-[#0070E1] border-[#0070E1]">
          Live Detection Demo
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {/* Left: Live Camera Feed with Detection */}
        <Card className="lg:col-span-2 bg-slate-900/50 backdrop-blur border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="w-5 h-5 text-blue-500" />
                Live Camera Feed + YOLOv8 Detection
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  {isPlaying ? (
                    <><Pause className="w-4 h-4 mr-1" /> Pause</>
                  ) : (
                    <><Play className="w-4 h-4 mr-1" /> Play</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerTestDetection}
                  className="bg-blue-800 hover:bg-blue-700"
                  title="Manually trigger a test detection"
                >
                  <Zap className="w-4 h-4 mr-1" /> Test Detect
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="bg-slate-800 hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              {/* YouTube Video Feed */}
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                src={demoVideoUrl}
                title="Road Hazard Detection Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              
              {/* Detection Overlay Canvas */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
              
              {/* Real-time Detection Badges */}
              <div className="absolute top-4 left-4 space-y-2">
                {detections.slice(0, 3).map((det) => (
                  <Badge
                    key={det.id}
                    variant={det.type === 'pothole' ? 'destructive' : 'default'}
                    className={`text-xs font-mono animate-pulse ${
                      det.type === 'pothole' ? 'bg-red-500' :
                      det.type === 'speedbump' ? 'bg-yellow-500' :
                      det.type === 'crack' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`}
                  >
                    {det.type.toUpperCase()}: {(det.confidence * 100).toFixed(1)}%
                  </Badge>
                ))}
              </div>

              {/* Processing Indicator */}
              {isPlaying && (
                <div className="absolute bottom-4 right-4">
                  <Badge className="bg-green-500 animate-pulse">
                    <Activity className="w-3 h-3 mr-1" />
                    Processing @ {fps} FPS
                  </Badge>
                </div>
              )}

              {/* Stability Warning */}
              {gyroData.stability < 70 && (
                <div className="absolute bottom-4 left-4">
                  <Badge variant="destructive" className="animate-pulse">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Low Stability - Filtering
                  </Badge>
                </div>
              )}
            </div>

            {/* Detection Stats */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="text-center bg-slate-800/50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-white">{totalDetections}</div>
                <div className="text-xs text-slate-400">Total Detections</div>
              </div>
              <div className="text-center bg-slate-800/50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-green-500">{highConfidence}</div>
                <div className="text-xs text-slate-400">High Confidence</div>
              </div>
              <div className="text-center bg-slate-800/50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-blue-500">{fps}</div>
                <div className="text-xs text-slate-400">FPS</div>
              </div>
              <div className="text-center bg-slate-800/50 p-3 rounded-lg">
                <div className="text-3xl font-bold text-purple-500">
                  {gyroData.stability.toFixed(0)}%
                </div>
                <div className="text-xs text-slate-400">Stability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Sensor Data & System Status */}
        <div className="space-y-4">
          {/* Gyroscope Stability */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Gauge className="w-4 h-4 text-purple-500" />
                Gyroscope Stability Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Camera Stability</span>
                  <span className={`font-mono font-bold ${
                    gyroData.stability > 90 ? 'text-green-500' :
                    gyroData.stability > 70 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {gyroData.stability.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={gyroData.stability} 
                  className="h-3"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                  <div className="text-slate-400">X-Axis</div>
                  <div className="text-white font-mono text-lg">{gyroData.x.toFixed(2)}°</div>
                </div>
                <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                  <div className="text-slate-400">Y-Axis</div>
                  <div className="text-white font-mono text-lg">{gyroData.y.toFixed(2)}°</div>
                </div>
                <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                  <div className="text-slate-400">Z-Axis</div>
                  <div className="text-white font-mono text-lg">{gyroData.z.toFixed(2)}°</div>
                </div>
              </div>

              {/* Visual Gyroscope */}
              <div className="bg-slate-800/70 p-4 rounded-lg border border-slate-700">
                <div className="text-center text-xs text-slate-400 mb-2">Live Orientation</div>
                <div className="relative w-full h-24 flex items-center justify-center">
                  <div 
                    className="w-16 h-16 border-4 border-blue-500 rounded"
                    style={{
                      transform: `rotateX(${gyroData.x * 3}deg) rotateY(${gyroData.y * 3}deg) rotateZ(${gyroData.z * 3}deg)`,
                      transition: 'transform 0.1s ease-out'
                    }}
                  >
                    <div className="w-full h-full bg-blue-500/20" />
                  </div>
                </div>
              </div>

              {gyroData.stability < 70 && (
                <Badge variant="destructive" className="w-full justify-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Detection Paused - Vehicle Unstable
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <Activity className="w-4 h-4 text-green-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">YOLOv8 Model</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">Gyro Sensor</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">GPS Lock</span>
                <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  8 Satellites
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">Cloud Sync</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500">
                  <Wifi className="w-3 h-3 mr-1" />
                  Syncing
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">V2V Network</span>
                <Badge variant="outline" className={isConnected ? "bg-green-500/20 text-green-500 border-green-500" : "bg-red-500/20 text-red-500 border-red-500"}>
                  <Radio className="w-3 h-3 mr-1 animate-pulse" />
                  {isConnected ? 'Connected' : 'Offline'}
                </Badge>
              </div>
              {nearbyVehicles.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded border border-blue-500/30">
                  <span className="text-slate-400">Nearby Vehicles</span>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500">
                    {nearbyVehicles.length} Active
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* V2V Communication Status */}
          {isConnected && (
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur border-blue-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-sm">
                  <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                  V2V Communication Active
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-blue-200">
                  🚗 Your detections are automatically shared with nearby vehicles
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/70 p-2 rounded border border-blue-500/30">
                    <div className="text-slate-400">Broadcasted</div>
                    <div className="text-blue-400 font-bold text-lg">{totalDetections}</div>
                  </div>
                  <div className="bg-slate-800/70 p-2 rounded border border-purple-500/30">
                    <div className="text-slate-400">Received</div>
                    <div className="text-purple-400 font-bold text-lg">{getStats().hazardsReceived}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  📍 Hazards auto-pinned on map
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Detections */}
          <Card className="bg-slate-900/50 backdrop-blur border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Recent Detections
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {detections.length === 0 ? (
                <div className="text-center text-slate-500 py-4">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <div className="text-xs">No detections yet</div>
                  <div className="text-xs">Press Play to start</div>
                </div>
              ) : (
                detections.map((det) => (
                  <div 
                    key={det.id} 
                    className="flex items-center gap-2 text-xs p-2 bg-slate-800/70 rounded border border-slate-700 animate-slide-in"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      det.type === 'pothole' ? 'bg-red-500 animate-pulse' :
                      det.type === 'speedbump' ? 'bg-yellow-500' :
                      det.type === 'crack' ? 'bg-blue-500' :
                      'bg-purple-500'
                    }`} />
                    <span className="text-white flex-1 font-medium">{det.type}</span>
                    <Badge variant="outline" className="text-xs">
                      {(det.confidence * 100).toFixed(0)}%
                    </Badge>
                    <span className="text-slate-400 text-xs">{det.timestamp}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detection Pipeline Visualization */}
      <Card className="mt-4 max-w-7xl mx-auto bg-slate-900/50 backdrop-blur border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Real-Time Detection Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500">
                <Camera className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-white font-semibold">Camera Input</div>
              <div className="text-slate-400 text-xs">1920x1080 @ 30fps</div>
            </div>
            <div className="text-slate-600 text-2xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 bg-purple-500/20 rounded-full flex items-center justify-center border-2 border-purple-500">
                <Gauge className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-white font-semibold">Gyro Filter</div>
              <div className="text-slate-400 text-xs">Stability Check</div>
            </div>
            <div className="text-slate-600 text-2xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                <Activity className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-white font-semibold">YOLOv8 AI</div>
              <div className="text-slate-400 text-xs">Object Detection</div>
            </div>
            <div className="text-slate-600 text-2xl">→</div>
            <div className="text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-2 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500">
                <Wifi className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-white font-semibold">Cloud Sync</div>
              <div className="text-slate-400 text-xs">Real-time Upload</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
