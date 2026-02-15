"use client"

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChatbotModal } from './chatbot-modal'; // This is fine since both are in ui folder

export function ChatbotTrigger() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    console.log('Opening modal...');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal...');
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 1 
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpenModal}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4488ff] to-[#3366ff] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <MessageCircle className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="font-medium">Chat with AI</span>
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#4488ff] animate-ping opacity-20" />
      </motion.button>

      {/* Modal */}
      <ChatbotModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}