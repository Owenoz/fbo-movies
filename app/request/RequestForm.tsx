'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Send, Check, AlertCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '256793854272' // Uganda format: 256 + 793854272

export default function RequestForm() {
  const [formData, setFormData] = useState({
    movieTitle: '',
    year: '',
    genre: '',
    preferredVJ: '',
    yourName: '',
    phoneNumber: '',
    additionalInfo: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    // Format message for WhatsApp
    const message = `🎬 *New Movie Request*\n\n` +
      `*Movie:* ${formData.movieTitle}${formData.year ? ` (${formData.year})` : ''}\n` +
      `*Genre:* ${formData.genre || 'Not specified'}\n` +
      `*Preferred VJ:* ${formData.preferredVJ || 'Any VJ'}\n\n` +
      `*Requested by:* ${formData.yourName}\n` +
      `*Phone:* ${formData.phoneNumber}\n\n` +
      `${formData.additionalInfo ? `*Additional Info:*\n${formData.additionalInfo}` : ''}`

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message)
    
    // WhatsApp URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

    // Open WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, '_blank')
      setStatus('success')
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          movieTitle: '',
          year: '',
          genre: '',
          preferredVJ: '',
          yourName: '',
          phoneNumber: '',
          additionalInfo: ''
        })
        setStatus('idle')
      }, 3000)
    }, 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative h-64 bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-purple-500 blur-3xl" />
        </div>
        <div className="relative text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Film className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-4">
              Request a Movie
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Tell us which movie you'd like to watch in Luganda and our VJs will work on it
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/5 border border-white/10 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Movie Title */}
            <div>
              <label htmlFor="movieTitle" className="block text-white font-semibold mb-2">
                Movie Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="movieTitle"
                name="movieTitle"
                required
                value={formData.movieTitle}
                onChange={handleChange}
                placeholder="e.g., Inception, The Matrix"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Year & Genre */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-white font-semibold mb-2">
                  Year (Optional)
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="2024"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label htmlFor="genre" className="block text-white font-semibold mb-2">
                  Genre (Optional)
                </label>
                <input
                  type="text"
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Action, Drama"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Preferred VJ */}
            <div>
              <label htmlFor="preferredVJ" className="block text-white font-semibold mb-2">
                Preferred VJ (Optional)
              </label>
              <select
                id="preferredVJ"
                name="preferredVJ"
                value={formData.preferredVJ}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Any VJ</option>
                <option value="VJ Junior">VJ Junior</option>
                <option value="VJ Emmy">VJ Emmy</option>
                <option value="VJ Ice P">VJ Ice P</option>
                <option value="VJ Jingo">VJ Jingo</option>
                <option value="VJ Ulio">VJ Ulio</option>
                <option value="VJ Mark">VJ Mark</option>
                <option value="VJ Muba">VJ Muba</option>
              </select>
            </div>

            {/* Your Name */}
            <div>
              <label htmlFor="yourName" className="block text-white font-semibold mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="yourName"
                name="yourName"
                required
                value={formData.yourName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-white font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0793854272"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Additional Info */}
            <div>
              <label htmlFor="additionalInfo" className="block text-white font-semibold mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Any specific details about the movie or your request..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={status === 'sending' || status === 'success'}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                status === 'success'
                  ? 'bg-green-600'
                  : status === 'error'
                  ? 'bg-red-600'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
              } disabled:opacity-50`}
            >
              {status === 'sending' && (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              )}
              {status === 'success' && (
                <>
                  <Check className="w-5 h-5" />
                  Request Sent!
                </>
              )}
              {status === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Failed to Send
                </>
              )}
              {status === 'idle' && (
                <>
                  <Send className="w-5 h-5" />
                  Send Request via WhatsApp
                </>
              )}
            </motion.button>

            {/* Info */}
            <p className="text-white/60 text-sm text-center">
              Your request will be sent directly to our team via WhatsApp at {WHATSAPP_NUMBER.replace('256', '0')}
            </p>
          </form>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 space-y-4"
        >
          <h3 className="font-bold text-2xl text-white mb-6">Frequently Asked Questions</h3>
          
          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h4 className="font-semibold text-white mb-2">How long does it take?</h4>
            <p className="text-white/70 text-sm">Translation time varies based on movie length and VJ availability. Typically 1-3 weeks.</p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h4 className="font-semibold text-white mb-2">Do I need to pay?</h4>
            <p className="text-white/70 text-sm">Requests are free. Once translated, the movie will be available to all FBO Movies users.</p>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-6">
            <h4 className="font-semibold text-white mb-2">Can I request any movie?</h4>
            <p className="text-white/70 text-sm">Yes! However, very new releases or movies with copyright issues may take longer.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
