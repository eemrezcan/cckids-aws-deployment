// components/contact/ContactForm.tsx
'use client';

import QuoteRequestForm from '@/components/QuoteRequestForm';

/**
 * ContactForm:
 * - Artık tekilleştirilmiş QuoteRequestForm'u (contact variant) kullanır.
 */
export default function ContactForm() {
  return <QuoteRequestForm variant="contact" />;
}
