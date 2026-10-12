import { memo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type SOSTriggerResponse =
  | { success?: boolean; status?: string; message?: string }
  | boolean
  | void;

interface SOSButtonProps {
  onSOSTriggered: () => Promise<SOSTriggerResponse> | SOSTriggerResponse;
}

export const SOSButton = memo(function SOSButton({ onSOSTriggered }: SOSButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [counting, setCounting] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const [status, setStatus] = useState<'countdown' | 'dispatching' | 'confirmed' | 'failed'>('countdown');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    let timeout: NodeJS.Timeout | undefined;

    if (counting && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (counting && countdown === 0) {
      setCounting(false);
      setStatus('dispatching');

      let triggerPromise: Promise<SOSTriggerResponse>;
      try {
        triggerPromise = Promise.resolve(onSOSTriggered());
      } catch (syncErr) {
        triggerPromise = Promise.reject(syncErr);
      }

      triggerPromise
        .then((result) => {
          if (!mountedRef.current) return;
          const isSuccess =
            result === true ||
            (typeof result === 'object' &&
              result !== null &&
              (result.success === true || (result as any).status === 'triggered'));

          if (isSuccess) {
            setStatus('confirmed');
            setTriggered(true);
            timeout = setTimeout(() => {
              if (mountedRef.current) {
                setDialogOpen(false);
                setTriggered(false);
                setStatus('countdown');
                setCountdown(5);
              }
            }, 3000);
          } else {
            setStatus('failed');
          }
        })
        .catch(() => {
          if (mountedRef.current) {
            setStatus('failed');
          }
        });
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [counting, countdown, onSOSTriggered]);

  const handlePress = () => {
    if (counting || status === 'dispatching') return;
    setStatus('countdown');
    setCountdown(5);
    setTriggered(false);
    setDialogOpen(true);
    setCounting(true);
  };

  const handleCancel = () => {
    setCounting(false);
    setCountdown(5);
    setStatus('countdown');
    setTriggered(false);
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setCounting(false);
            setCountdown(5);
            setStatus('countdown');
            setTriggered(false);
          }
        }}
      >
        <DialogContent className="max-w-sm rounded-3xl border-slate-200 p-6 text-center">
          {status === 'countdown' && (
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
          )}

          {status === 'dispatching' && (
            <div className="py-8 space-y-3">
              <Loader2 className="w-12 h-12 text-rose-600 animate-spin mx-auto" />
              <DialogTitle className="text-lg font-extrabold text-slate-900 font-heading">
                Dispatching Emergency Alert...
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Transmitting telemetry and GPS coordinates to emergency services
              </DialogDescription>
            </div>
          )}

          {status === 'confirmed' && (
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

          {status === 'failed' && (
            <div className="py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <DialogTitle className="text-xl font-extrabold text-rose-700 font-heading">
                  Dispatch Unconfirmed
                </DialogTitle>
                <DialogDescription className="text-xs text-rose-600 mt-1">
                  Server could not confirm emergency dispatch. Note that a prior attempt may have reached the server; retries are not guaranteed to be deduplicated. Please contact local emergency services immediately (911 / 112).
                </DialogDescription>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 rounded-xl text-xs font-bold"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setStatus('countdown');
                    setCountdown(5);
                    setCounting(true);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                >
                  Retry SOS
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});
