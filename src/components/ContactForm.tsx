'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface FormData {
  name: string;
  email: string;
  description: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  description?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    description: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Using EmailJS to send the email
      const emailjs = (await import('@emailjs/browser')).default;

      // You'll need to replace these with your actual EmailJS service details
      const serviceId =
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_senkn2a';
      const templateId =
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id';
      const publicKey =
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.description + ' - ' + formData.email,
        to_email: 'dirckmulder20@gmail.com', // Replace with your email
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);

      setSubmitStatus('success');
      setFormData({ name: '', email: '', description: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id='contact'
      className='w-full py-16 px-6 bg-gradient-to-b from-transparent to-neutral-light'
    >
      <div className='container mx-auto max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-4xl text-black mb-4 font-bold'>Get In Touch</h2>
          <p className='text-lg text-text-muted max-w-2xl mx-auto'>
            Have a project in mind or just want to chat? I'd love to hear from
            you. Send me a message and I'll get back to you as soon as possible.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className='bg-white rounded-2xl shadow-xl p-8 md:p-12'
        >
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Name Field */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-text-primary mb-2'
              >
                Name *
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                  errors.name ? 'border-red-500' : 'border-library-border'
                }`}
                placeholder='Your full name'
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-500'>{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-text-primary mb-2'
              >
                Email *
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-red-500' : 'border-library-border'
                }`}
                placeholder='your.email@example.com'
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className='mt-1 text-sm text-red-500'>{errors.email}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label
                htmlFor='description'
                className='block text-sm font-medium text-text-primary mb-2'
              >
                Message *
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 resize-vertical ${
                  errors.description
                    ? 'border-red-500'
                    : 'border-library-border'
                }`}
                placeholder='Tell me about your project, ideas, or just say hello...'
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className='mt-1 text-sm text-red-500'>
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type='submit'
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                isSubmitting
                  ? 'bg-library-gray cursor-not-allowed'
                  : 'bg-black hover:bg-neutral-800'
              }`}
            >
              {isSubmitting ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Sending...
                </div>
              ) : (
                'Send Message'
              )}
            </motion.button>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='p-4 bg-green-50 border border-green-200 rounded-lg'
              >
                <p className='text-green-800 text-center'>
                  ✅ Message sent successfully! I'll get back to you soon.
                </p>
              </motion.div>
            )}

            {submitStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='p-4 bg-red-50 border border-red-200 rounded-lg'
              >
                <p className='text-red-800 text-center'>
                  ❌ Something went wrong. Please try again or contact me
                  directly.
                </p>
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>
    </section>
  );
}
