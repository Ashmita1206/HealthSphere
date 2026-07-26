import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileAvatarProps {
  full_name: string;
}

export function ProfileAvatar({ full_name }: ProfileAvatarProps) {
  const { toast } = useToast();

  const handleAvatarUpload = () => {
    // TODO: Backend Integration - Implement avatar upload functionality
    toast({
      title: 'Avatar upload is not connected yet',
      description: 'Your current profile photo remains unchanged.',
    });
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar className="h-20 w-20 rounded-2xl border-2 border-teal-600/30 shadow-md">
        <AvatarFallback className="bg-teal-700 text-white font-extrabold text-2xl font-heading rounded-2xl">
          {full_name?.charAt(0)?.toUpperCase() || 'P'}
        </AvatarFallback>
      </Avatar>
      <div>
        <Button
          variant="outline"
          onClick={handleAvatarUpload}
          className="text-xs font-bold text-slate-700 border-slate-200 rounded-xl h-9 gap-2"
          aria-label="Upload new avatar"
        >
          <Camera className="h-3.5 w-3.5 text-teal-700" />
          <span>Upload New Avatar</span>
        </Button>
        <p className="text-[11px] text-slate-400 mt-1 font-normal">JPG, PNG or WEBP (Max size 2MB)</p>
      </div>
    </div>
  );
}
