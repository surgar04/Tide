"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser, faUpload, faImage, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/lib/auth/context';

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file);
        setAvatar(compressed);
      } catch (error) {
        console.error("Image compression failed", error);
        // Fallback to original if compression fails (though unlikely)
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username || !avatar) return;

    setIsSubmitting(true);
    try {
      // Simulate network delay for effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await login({
        email,
        username,
        avatar
      }, password);
    } catch (error) {
      console.error("Login failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--end-text-main)] mb-2 uppercase tracking-widest">
            System Login
          </h1>
          <div className="h-[1px] w-24 bg-[var(--end-yellow)] mx-auto mb-4"></div>
          <p className="text-[var(--end-text-sub)] text-sm font-mono">
            SECURE TERMINAL ACCESS
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-[var(--end-border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <div className="w-16 h-16 border-t-2 border-r-2 border-[var(--end-yellow)] rounded-tr-xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group
                  ${avatar ? 'border-[var(--end-yellow)] bg-black' : 'border-slate-600 hover:border-[var(--end-yellow)] hover:bg-white/5'}
                `}
              >
                {avatar ? (
                  <>
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FontAwesomeIcon icon={faUpload} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <FontAwesomeIcon icon={faImage} className="text-2xl text-slate-500 mb-1 block mx-auto" />
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Upload ID</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload} 
              />
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="relative group">
                <FontAwesomeIcon icon={faUser} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--end-yellow)] transition-colors" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="OPERATOR NAME"
                  className="w-full bg-black/20 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-sm"
                />
              </div>

              <div className="relative group">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--end-yellow)] transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black/20 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-sm"
                />
              </div>

              <div className="relative group">
                <FontAwesomeIcon icon={faLock} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[var(--end-yellow)] transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ACCESS CODE"
                  className="w-full bg-black/20 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--end-yellow)] transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!username || !email || !password || !avatar || isSubmitting}
              className="w-full bg-[var(--end-yellow)] hover:bg-[#ffe066] text-black font-bold py-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(255,199,0,0.3)]"
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  AUTHENTICATING...
                </>
              ) : (
                <>
                  INITIALIZE
                  <FontAwesomeIcon icon={faArrowRight} />
                </>
              )}
            </button>

          </form>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-[10px] text-slate-600 font-mono">
          <div>TIDE OA SYSTEM v2.0.4</div>
          <div>ENCRYPTED LOCAL STORAGE ENABLED</div>
        </div>
      </motion.div>
    </div>
  );
}
