
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MicrophonePermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestAccess: () => void;
  onCancel: () => void;
}

const MicrophonePermissionDialog: React.FC<MicrophonePermissionDialogProps> = ({
  open,
  onOpenChange,
  onRequestAccess,
  onCancel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Heimild fyrir hljóðnema</DialogTitle>
          <DialogDescription>
            Til að nota sjálfvirka raddgreiningu þarf app-ið að fá aðgang að hljóðnemanum þínum.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-3 sm:justify-start">
          <Button
            type="button"
            variant="default"
            onClick={onRequestAccess}
          >
            Leyfa aðgang
          </Button>
          <Button
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Hætta við
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MicrophonePermissionDialog;
