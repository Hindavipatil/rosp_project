import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import {
  Mail, Phone, MapPin, Loader2, CheckCircle, Send, Globe2
} from 'lucide-react';
import './Contacts.css';

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { type: 'general_inquiry' } });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inquiryOptions = [
    { label: 'General Inquiry',        value: 'general_inquiry' },
    { label: 'Volunteer Interest',     value: 'volunteer_interest' },
    { label: 'Collaboration Proposal', value: 'collaboration' },
    { label: 'Media Request',          value: 'media' },
  ];

  const contactInfo = [
    {
      icon: <Mail size={16} />,
      label: 'Email',
      value: <a href="mailto:advranjanaswankhade@gmail.com">advranjanaswankhade@gmail.com</a>,
    },
    {
      icon: <Phone size={16} />,
      label: 'Phone',
      value: '+91 8369761080',
    },
    {
      icon: <Globe2 size={16} />,
      label: 'Website',
      value: <a href="https://aibistreet.com/" target="_blank" rel="noopener noreferrer">aibistreet.com</a>,
    },
    {
      icon: <MapPin size={16} />,
      label: 'Office',
      value: 'AI BI Street Pvt Ltd. Shop No 1 & 2, Shivshank Tower, Near Coral Bell School, Airoli, Sector 20B, Navi Mumbai',
    },
  ];

  const formFields = [
    { id: 'full_name', label: 'Full Name',         type: 'text',     required: true,  placeholder: 'Yashashree Patil' },
    { id: 'email',     label: 'Email Address',     type: 'email',    required: true,  placeholder: 'you@example.com', pattern: /^\S+@\S+$/i },
    { id: 'phone',     label: 'Phone (Optional)',  type: 'tel',      required: false, placeholder: '+91 98765 43210' },
    { id: 'subject',   label: 'Subject',           type: 'text',     required: true,  placeholder: 'How can we help?' },
    { id: 'message',   label: 'Message',           type: 'textarea', required: true,  rows: 5, placeholder: 'Tell us more…' },
  ];

  const onSubmit = (data) => {
    setIsLoading(true);
    setIsSuccess(false);
    console.log('Form submitted:', data); // Replace with API call
    setTimeout(() => {
      setIsSuccess(true);
      reset({ type: 'general_inquiry' });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      <div className="contact-page">

        {/* ── Hero ── */}
        <section className="contact-header">
          <div className="contact-header-inner">
            <div className="contact-eyebrow">
              <Mail size={12} />
              Get in Touch
            </div>
            <h1>Contact &amp; <em>Volunteer</em></h1>
            <p>
              We'd love to hear from you. Whether you have a question, a proposal,
              or want to join our mission — reach out to us.
            </p>
          </div>
        </section>

        {/* ── Content grid ── */}
        <div className="contact-content">

          {/* ── Form card ── */}
          <motion.div
            className="contact-form-card"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2>Send Us a Message</h2>

            {/* Success message */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  className="success-message"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle size={22} />
                  <div>
                    <h3>Thank You!</h3>
                    <p>Your message has been sent. We'll get back to you shortly.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              {/* Inquiry type */}
              <div>
                <label htmlFor="type">Inquiry Type</label>
                <select id="type" {...register('type')}>
                  {inquiryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Dynamic fields */}
              {formFields.map(field => (
                <div key={field.id}>
                  <label htmlFor={field.id}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.id}
                      rows={field.rows}
                      placeholder={field.placeholder}
                      {...register(field.id, { required: field.required })}
                    />
                  ) : (
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      {...register(field.id, {
                        required: field.required,
                        pattern: field.pattern,
                      })}
                    />
                  )}
                  {errors[field.id] && (
                    <p className="field-error">{field.label} is required</p>
                  )}
                </div>
              ))}

              <button type="submit" disabled={isLoading}>
                {isLoading
                  ? <Loader2 size={18} className="spin" />
                  : <Send size={18} />
                }
                {isLoading ? 'Sending…' : 'Send Message'}
              </button>

            </form>
          </motion.div>

          {/* ── Right column: info + map ── */}
          <div className="contact-side">

            {/* Info card */}
            <motion.div
              className="contact-info-card"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
            >
              <h3>Contact Information</h3>
              {contactInfo.map((info, idx) => (
                <div key={idx} className="contact-info-item">
                  <div className="contact-info-icon">{info.icon}</div>
                  <div>
                    <h4>{info.label}</h4>
                    <div>{info.value}</div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Map card */}
            <motion.div
              className="map-card"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3>Office Location</h3>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.876255623511!2d72.98901507521317!3d19.16575648205517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b9d32f9202b3%3A0xd89e8a25c6fa4515!2sAI%20BI%20Street%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1728659345678!5m2!1sen!2sin"
                title="Office Location"
                loading="lazy"
                allowFullScreen
              />
            </motion.div>

          </div>
        </div>

      </div>
    </>
  );
}