'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SubscriptionPlans from "./subscription-plans";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscriptionDialog({
  open,
  onOpenChange,
}: SubscriptionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Upgrade Your Account</DialogTitle>
          <DialogDescription>
            You've reached the limit of your free credits. Choose a plan to
            continue creating amazing videos.
          </DialogDescription>
        </DialogHeader>
        <SubscriptionPlans />
      </DialogContent>
    </Dialog>
  );
}
