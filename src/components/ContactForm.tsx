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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Message is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Message must be at least 10 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const emailjs = (await import('@emailjs/browser')).default;
      const serviceId =
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_senkn2a';
      const templateId =
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id';
      const publicKey =
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key';

      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.description + ' - ' + formData.email,
          to_email: 'dirckmulder20@gmail.com',
        },
        publicKey
      );

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
    <div className='max-w-5xl mx-auto px-6 md:px-16'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-16'>
        {/* Left side - info */}
        <div className='flex flex-col justify-between'>
          <div>
            <p className='text-library-gray leading-relaxed mb-8'>
              Have a project in mind or just want to chat? I would love to hear
              from you. Send me a message and I will get back to you soon.
            </p>
            <div className='space-y-4'>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-library-gray mb-1'>
                  Email
                </p>
                <a
                  href='mailto:dirckmulder20@gmail.com'
                  className='text-black hover:text-library-gray transition-colors text-sm'
                >
                  dirckmulder20@gmail.com
                </a>
              </div>
              <div>
                <p className='text-[10px] uppercase tracking-widest text-library-gray mb-1'>
                  Based in
                </p>
                <p className='text-black text-sm'>The Netherlands</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Name */}
          <div className='relative'>
            <label
              htmlFor='name'
              className={`absolute left-0 transition-all duration-200 ${
                focusedField === 'name' || formData.name
                  ? 'text-[10px] -top-4 uppercase tracking-widest text-library-gray'
                  : 'text-sm top-3 text-library-gray'
              }`}
            >
              Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className={`w-full py-3 bg-transparent border-b transition-colors duration-200 outline-none text-black ${
                errors.name
                  ? 'border-red-400'
                  : focusedField === 'name'
                    ? 'border-primary'
                    : 'border-library-border'
              }`}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className='mt-1 text-xs text-red-400'>{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className='relative'>
            <label
              htmlFor='email'
              className={`absolute left-0 transition-all duration-200 ${
                focusedField === 'email' || formData.email
                  ? 'text-[10px] -top-4 uppercase tracking-widest text-library-gray'
                  : 'text-sm top-3 text-library-gray'
              }`}
            >
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className={`w-full py-3 bg-transparent border-b transition-colors duration-200 outline-none text-black ${
                errors.email
                  ? 'border-red-400'
                  : focusedField === 'email'
                    ? 'border-primary'
                    : 'border-library-border'
              }`}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className='mt-1 text-xs text-red-400'>{errors.email}</p>
            )}
          </div>

          {/* Message */}
          <div className='relative'>
            <label
              htmlFor='description'
              className={`absolute left-0 transition-all duration-200 ${
                focusedField === 'description' || formData.description
                  ? 'text-[10px] -top-4 uppercase tracking-widest text-library-gray'
                  : 'text-sm top-3 text-library-gray'
              }`}
            >
              Message
            </label>
            <textarea
              id='description'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField(null)}
              rows={4}
              className={`w-full py-3 bg-transparent border-b transition-colors duration-200 outline-none text-black resize-none ${
                errors.description
                  ? 'border-red-400'
                  : focusedField === 'description'
                    ? 'border-primary'
                    : 'border-library-border'
              }`}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className='mt-1 text-xs text-red-400'>{errors.description}</p>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type='submit'
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full py-4 text-sm uppercase tracking-widest font-medium transition-all duration-200 ${
              isSubmitting
                ? 'bg-library-gray text-white cursor-not-allowed'
                : 'bg-gradient-primary text-white'
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </motion.button>

          {submitStatus === 'success' && (
            <p className='text-sm text-black text-center'>
              Message sent. I will get back to you soon.
            </p>
          )}
          {submitStatus === 'error' && (
            <p className='text-sm text-red-400 text-center'>
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
