import React, { useState, useEffect, useRef } from "react";
import { GlassCard, Button } from "../components/UI";
import { Phone, Video, PhoneOff, Mic, MicOff, VideoOff, ScreenShare, Users, X, Maximize2, Minimize2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { socketService } from "../utils/socket";
import { cn } from "../components/UI";
import { auth } from "../firebase";

interface CallProps {
  type: "voice" | "video";
  friendName: string;
  friendId: string;
  onClose: () => void;
}

export const CallUI: React.FC<CallProps> = ({ type, friendName, friendId, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === "voice");
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<"calling" | "connected" | "ended">("calling");
  const [isMinimized, setIsMinimized] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socket = useRef(socketService.getSocket());
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    }
    
    // WebRTC Setup
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: !isVideoOff, 
          audio: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // Emit call event
        socket.current.emit("call-user", {
          userToCall: friendId,
          signalData: { type: "offer", sdp: "mock-sdp" },
          from: userId,
          name: auth.currentUser?.displayName || "User"
        });
      } catch (err) {
        console.error("Media access denied", err);
      }
    };

    startMedia();

    socket.current.on("call-accepted", (signal: any) => {
      setCallStatus("connected");
      console.log("Call accepted by friend");
    });

    socket.current.on("call-ended", () => {
      setCallStatus("ended");
      setTimeout(onClose, 2000);
    });

    return () => {
      if (timer) clearInterval(timer);
      if (localVideoRef.current?.srcObject) {
        (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      socket.current.off("call-accepted");
      socket.current.off("call-ended");
    };
  }, [friendId, isVideoOff, callStatus, userId, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    socket.current.emit("end-call", { to: friendId });
    onClose();
  };

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden"
        >
          {/* Remote Video (Full Screen) */}
          <div className="flex-1 relative bg-secondary overflow-hidden">
            {isVideoOff ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent">
                <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center border-4 border-primary/20 shadow-2xl shadow-primary/10">
                  <Users size={64} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-foreground tracking-tight">{friendName}</h2>
                  <p className="text-primary font-mono text-lg mt-2 font-medium">
                    {callStatus === "calling" ? "Calling..." : formatTime(callDuration)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 z-20">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{friendName}</h2>
                  <p className="text-emerald-400 font-mono text-sm drop-shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Live • {formatTime(callDuration)}
                  </p>
                </div>
              </>
            )}

            {/* Local Video (PIP) */}
            {!isVideoOff && (
              <motion.div 
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                className="absolute top-6 right-6 w-32 md:w-48 aspect-video bg-black rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-30 cursor-move"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Top Controls */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              <Button 
                variant="glass" 
                size="sm" 
                className="rounded-full p-2"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 size={18} />
              </Button>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="h-24 md:h-32 bg-background/80 backdrop-blur-2xl border-t border-border flex items-center justify-center gap-4 md:gap-8 px-6 z-40">
            <Button
              variant="glass"
              className={cn(
                "p-4 rounded-full transition-all duration-300", 
                isMuted ? "bg-rose-500/20 text-rose-500 border-rose-500/50" : "hover:bg-primary/10"
              )}
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            <Button
              variant="glass"
              className={cn(
                "p-4 rounded-full transition-all duration-300", 
                isVideoOff ? "bg-rose-500/20 text-rose-500 border-rose-500/50" : "hover:bg-primary/10"
              )}
              onClick={() => setIsVideoOff(!isVideoOff)}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
            </Button>

            <Button
              variant="danger"
              className="p-5 rounded-full shadow-2xl shadow-rose-600/40 hover:scale-110 transition-transform active:scale-95"
              onClick={handleEndCall}
            >
              <PhoneOff size={32} />
            </Button>

            <Button
              variant="glass"
              className={cn(
                "p-4 rounded-full transition-all duration-300", 
                isScreenSharing ? "bg-primary text-white" : "hover:bg-primary/10"
              )}
              onClick={() => setIsScreenSharing(!isScreenSharing)}
            >
              <ScreenShare size={24} />
            </Button>

            <Button variant="glass" className="p-4 rounded-full hover:bg-primary/10">
              <Users size={24} />
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          layoutId="call-pip"
          className="fixed bottom-24 right-6 z-[100] w-48 h-64 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex-1 relative bg-secondary flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Users size={32} className="text-primary" />
            </div>
            <h4 className="text-sm font-bold text-foreground truncate w-full">{friendName}</h4>
            <p className="text-[10px] text-primary font-mono">{formatTime(callDuration)}</p>
            
            <button 
              onClick={() => setIsMinimized(false)}
              className="absolute top-2 right-2 p-1 bg-background/50 rounded-full hover:bg-background"
            >
              <Maximize2 size={14} />
            </button>
          </div>
          <div className="h-12 bg-secondary/50 border-t border-border flex items-center justify-center gap-3">
            <button onClick={() => setIsMuted(!isMuted)} className={cn(isMuted && "text-rose-500")}>
              {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button onClick={handleEndCall} className="text-rose-500">
              <PhoneOff size={20} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
