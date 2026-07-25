import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SOSButtonProps {
  onSOSTriggered: () => void;
}

export const SOSButton = memo(function SOSButton({ onSOSTriggered }: SOSButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [counting, setCounting] = useState(false);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (counting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCounting(false);
      setTriggered(true);
      // TODO: Backend integration for SOS trigger
      onSOSTriggered();
      setTimeout(() => {
        setDialogOpen(false);
        setTriggered(false);
        setCountdown(5);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [counting, countdown, onSOSTriggered]);

  const handlePress = () => {
    setDialogOpen(true);
    setCounting(true);
  };

  const handleCancel = () => {
    setCounting(false);
    setCountdown(5);
    setDialogOpen(false);
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={handlePress}
        className="relative w-48 h-48 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-rose-600 to-red-700 shadow-2xl shadow-rose-500/50 hover:shadow-rose-500/70 transition-all duration-300 flex flex-col items-center justify-center group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Emergency SOS Button"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-rose-500/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 rounded-full bg-rose-400/20"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        <AlertTriangle className="w-16 h-16 text-white mb-2 stroke-[2]" />
        <span className="text-white text-2xl font-extrabold font-heading tracking-wider">
          SOS
        </span>
        <span className="text-white/80 text-xs font-medium mt-1">
          Emergency
        </span>
      </motion.button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-slate-200 p-6 text-center">
          {!triggered ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-extrabold text-rose-700 font-heading">
                  Emergency SOS
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Press and hold to trigger emergency alert
                </DialogDescription>
              </DialogHeader>

              <div className="py-8">
                <motion.div
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-extrabold text-rose-700 font-heading"
                >
                  {countdown}
                </motion.div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full h-12 text-sm font-bold rounded-xl border-slate-200 text-slate-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <div className="py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-4"
              >
                <AlertTriangle className="w-10 h-10" />
              </motion.div>
              <DialogTitle className="text-xl font-extrabold text-emerald-700 font-heading mb-2">
                SOS Triggered
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Emergency alert has been sent to your contacts
              </DialogDescription>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
