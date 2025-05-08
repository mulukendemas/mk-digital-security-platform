
import React from "react";
import { ContactMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, User, ArrowLeft, Trash } from "lucide-react";

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    console.error('Date parsing error:', error);
    return 'Invalid Date';
  }
};

interface ContactMessageDetailProps {
  message: ContactMessage;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const ContactMessageDetail = ({
  message,
  onClose,
  onDelete,
}: ContactMessageDetailProps) => {
  return (
    <div className="bg-white rounded-md shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onClose}
        >
          <ArrowLeft className="h-4 w-4" /> Back to messages
        </Button>

        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold mb-2">{message.subject}</h2>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>From: {message.name}</span>
            </div>
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              <span>Email: {message.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>Date: {formatDate(message.created_at)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Message</h3>
          <div className="bg-gray-50 p-4 rounded border whitespace-pre-wrap">
            {message.message}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button
            variant="default"
            className="flex items-center gap-1"
            onClick={() => window.location.href = `mailto:${message.email}?subject=Re: ${message.subject}`}
          >
            <Mail className="h-4 w-4" /> Reply via Email
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContactMessageDetail;


