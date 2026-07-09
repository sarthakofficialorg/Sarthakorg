import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, Phone, User, Tag, HelpCircle, CheckCircle2 } from 'lucide-react';
import { submitJoinForm, submitContactForm } from '../lib/firebase';
import { compressImage } from '../lib/imageCompressor';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinModal: React.FC<JoinModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    recentImage: '', // base64/dataURL
    address: '',
    dob: '',
    bloodGroup: 'A+',
    agreeToDonateBlood: 'Yes' as 'Yes' | 'No',
    educationalQualification: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email || !formData.address || !formData.dob || !formData.bloodGroup || !formData.educationalQualification) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!formData.termsAccepted) {
      setError('You must read and accept the terms and conditions.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await submitJoinForm({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        recentImage: formData.recentImage || '',
        address: formData.address,
        dob: formData.dob,
        bloodGroup: formData.bloodGroup,
        agreeToDonateBlood: formData.agreeToDonateBlood,
        educationalQualification: formData.educationalQualification,
        termsAccepted: formData.termsAccepted
      });
      setSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        recentImage: '',
        address: '',
        dob: '',
        bloodGroup: 'A+',
        agreeToDonateBlood: 'Yes',
        educationalQualification: '',
        termsAccepted: false
      });
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 my-8"
          >
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-rose-600 to-pink-500 text-white p-6 md:p-8">
              <button
                id="btn-close-join-modal"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-white" />
                <h3 className="font-sans text-2xl font-bold tracking-tight">Join as a Volunteer</h3>
              </div>
              <p className="font-sans text-xs text-rose-50 leading-relaxed">
                Be the reason someone smiles today. Provide your info to join the SARTHAK family.
              </p>
            </div>

            {/* Body Form or Success Message */}
            <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4 border border-green-100">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-sans text-xl font-bold text-gray-900 mb-2">Thank You for Joining!</h4>
                  <p className="font-sans text-sm text-gray-600 max-w-sm mb-6">
                    Your application has been received successfully. Our onboarding team will get in touch with you shortly.
                  </p>
                  <button
                    id="btn-join-success-close"
                    onClick={() => {
                      setSubmitted(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Contact Number & Email Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. +91 98765 43210"
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Upload Recent Image */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Upload your recent image (Optional)
                    </label>
                    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-150">
                      {formData.recentImage ? (
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-300">
                          <img src={formData.recentImage} alt="Profile" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, recentImage: '' }))}
                            className="absolute inset-0 bg-black/60 text-white text-[9px] flex items-center justify-center font-bold uppercase hover:bg-black/80 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200 font-sans text-[10px] font-bold uppercase text-center">
                          No Photo
                        </div>
                      )}
                      <label className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 text-rose-700 rounded-xl text-xs font-bold cursor-pointer transition-all text-center">
                        Select Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 10 * 1024 * 1024) {
                              alert("Please select an image file under 10MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = async () => {
                              if (typeof reader.result === 'string') {
                                try {
                                  const compressed = await compressImage(reader.result);
                                  setFormData(prev => ({ ...prev, recentImage: compressed }));
                                } catch (err) {
                                  console.error(err);
                                  setFormData(prev => ({ ...prev, recentImage: reader.result as string }));
                                }
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Enter your complete residential address..."
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  {/* Date of Birth & Blood Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Blood Group *
                      </label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  {/* Agree to Donate Blood in Emergency cases */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Are you agree to donate your blood in emergency cases? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          name="agreeToDonateBlood"
                          value="Yes"
                          checked={formData.agreeToDonateBlood === 'Yes'}
                          onChange={() => setFormData(prev => ({ ...prev, agreeToDonateBlood: 'Yes' }))}
                          className="accent-rose-600"
                        />
                        <span className="font-sans text-sm font-semibold text-gray-800">Yes</span>
                      </label>
                      <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          name="agreeToDonateBlood"
                          value="No"
                          checked={formData.agreeToDonateBlood === 'No'}
                          onChange={() => setFormData(prev => ({ ...prev, agreeToDonateBlood: 'No' }))}
                          className="accent-rose-600"
                        />
                        <span className="font-sans text-sm font-semibold text-gray-800">No</span>
                      </label>
                    </div>
                  </div>

                  {/* Educational Qualification */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Educational qualification *
                    </label>
                    <input
                      type="text"
                      name="educationalQualification"
                      value={formData.educationalQualification}
                      onChange={handleChange}
                      placeholder="e.g. Bachelor of Science, High School"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Terms and Conditions Section */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                    <p className="font-sans text-xs text-gray-500 leading-relaxed font-semibold uppercase tracking-wide">
                      Terms and Conditions
                    </p>
                    <p className="font-sans text-xs text-gray-600 leading-relaxed">
                      By submitting this joining form, the applicant (“You”) acknowledges that all information provided is true, complete, and accurate to the best of your knowledge. Submission of the form signifies your agreement to comply with all terms, policies, and rules of the Organization.
                    </p>
                    <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleCheckboxChange}
                        required
                        className="w-4 h-4 mt-0.5 accent-rose-600 rounded focus:ring-rose-500"
                      />
                      <span className="font-sans text-xs text-gray-700 font-medium leading-relaxed">
                        I agree to accept all terms and conditions of Sarthak. *
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-volunteer"
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md shadow-pink-100 hover:shadow-none transition-all"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Joining Form'}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.subject || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 my-8"
          >
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-850 text-white p-6 md:p-8 border-b">
              <button
                id="btn-close-contact-modal"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <HelpCircle className="w-6 h-6 text-rose-500" />
                <h3 className="font-sans text-2xl font-bold tracking-tight">Contact Sarthak</h3>
              </div>
              <p className="font-sans text-xs text-gray-300 leading-relaxed">
                Have an inquiry, feedback, or need support? Drop us a message, and we'll reply right away.
              </p>
            </div>

            {/* Body Form or Success Message */}
            <div className="p-6 md:p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-4 border border-green-100">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="font-sans text-xl font-bold text-gray-900 mb-2">Message Sent!</h4>
                  <p className="font-sans text-sm text-gray-600 max-w-sm mb-6">
                    Thank you for reaching out. Your query has been logged. Our administrative office will email or call you shortly.
                  </p>
                  <button
                    id="btn-contact-success-close"
                    onClick={() => {
                      setSubmitted(false);
                      onClose();
                    }}
                    className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md transition-all"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-700 text-xs p-3 rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {/* Your Name */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Your Name *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Sarah Smith"
                        required
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="sarah@example.com"
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          required
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="E.g., CSR Sponsorship, Donation Support, Event Inquiry"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-sans text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Write your query or message in detail..."
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-sans text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-contact"
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-gray-900 hover:bg-black disabled:bg-gray-500 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer shadow-md hover:shadow-none transition-all"
                  >
                    {loading ? 'Sending Message...' : 'Send Message'}
                    <Send className="w-4 h-4 text-rose-500" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
