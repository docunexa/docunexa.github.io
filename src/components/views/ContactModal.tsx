import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Modal } from '../common/Modal';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Contact & Feedback"
      subtitle="Have a question, format request, or issue to report?"
      maxWidth="md"
    >
      {submitted ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-df-blue/10 text-df-blue flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-df-black dark:text-df-white">Thank You!</h4>
          <p className="text-xs text-df-black/60 dark:text-df-white/60">
            Your message has been recorded locally. You can also open an issue on our GitHub repository.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              onClose();
            }}
            className="px-4 py-2 rounded-btn bg-df-blue text-df-white text-xs font-semibold"
          >
            Close
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-df-black dark:text-df-white">Your Email</label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-df-black dark:text-df-white">Message or Tool Request</label>
            <textarea
              required
              rows={4}
              placeholder="Tell us what file format or workflow you'd like improved..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded border border-df-black/15 dark:border-df-white/15 bg-df-white dark:bg-df-black text-df-black dark:text-df-white focus:border-df-blue resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-btn border border-df-black/15 dark:border-df-white/15 text-df-black dark:text-df-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-btn bg-df-blue text-df-white font-semibold"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

