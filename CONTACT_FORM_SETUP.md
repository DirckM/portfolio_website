# Contact Form Setup Instructions

## EmailJS Configuration

To enable the contact form to send emails, you need to set up EmailJS:

### 1. Create EmailJS Account

- Go to [https://www.emailjs.com/](https://www.emailjs.com/)
- Sign up for a free account

### 2. Set Up Email Service

- Go to "Email Services" in your dashboard
- Add your email service (Gmail, Outlook, etc.)
- Note down your **Service ID**

### 3. Create Email Template

- Go to "Email Templates"
- Create a new template with these variables:
  - `{{from_name}}` - Sender's name
  - `{{from_email}}` - Sender's email
  - `{{message}}` - The message content
  - `{{to_email}}` - Your email address
- Note down your **Template ID**

### 4. Get Public Key

- Go to "Account" > "API Keys"
- Copy your **Public Key**

### 5. Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here
```

### 6. Update Contact Form

In `src/components/ContactForm.tsx`, replace:

- `'your-email@example.com'` with your actual email address

### 7. Test the Form

- Start your development server
- Navigate to the contact form
- Fill out and submit a test message
- Check your email for the message

## Features

✅ **Form Validation**: Name, email, and message validation  
✅ **Error Handling**: User-friendly error messages  
✅ **Loading States**: Visual feedback during submission  
✅ **Success/Error Messages**: Clear status indicators  
✅ **Responsive Design**: Works on all devices  
✅ **Smooth Animations**: Framer Motion animations

## Troubleshooting

- Make sure all environment variables are set correctly
- Check that your EmailJS service is active
- Verify the email template variables match the code
- Check browser console for any errors
