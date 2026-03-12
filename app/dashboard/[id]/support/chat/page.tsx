'use client';

import { useState } from 'react';
import { Send, Paperclip, Smile, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const mockChats = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  customerName: `Customer ${i + 1}`,
  customerId: `cust-${i + 1}`,
  avatar: '👤',
  lastMessage: ['Can you help me with my order?', 'I need to return this item', 'When will it arrive?'][i % 3],
  unreadCount: [0, 2, 1, 0, 3, 0][i % 6],
  status: i % 3 === 0 ? 'online' : 'offline',
}));

const mockMessages = [
  { id: 1, sender: 'customer', text: 'Hi, I have a question about order ORD-123456', time: '10:30 AM' },
  { id: 2, sender: 'support', text: 'Hello! I\'m happy to help. What\'s your question?', time: '10:31 AM' },
  { id: 3, sender: 'customer', text: 'The tracking shows my package is out for delivery, but I\'m not home', time: '10:32 AM' },
  { id: 4, sender: 'support', text: 'Let me check that for you. Can you provide the order details?', time: '10:33 AM' },
  { id: 5, sender: 'customer', text: 'Order number is ORD-123456, placed on March 5th', time: '10:34 AM' },
  { id: 6, sender: 'support', text: 'I can see your order. The delivery window is 2-4 PM today. You can also request a reschedule.', time: '10:35 AM' },
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = mockChats.filter(chat =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedChatData = mockChats.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Live Chat Support</h1>
        <p className="text-muted-foreground">Real-time customer communication</p>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`w-full px-4 py-3 border-b text-left hover:bg-muted/50 transition-colors ${selectedChat === chat.id ? 'bg-primary/10' : ''
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{chat.customerName}</p>
                      {chat.unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{chat.lastMessage}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${chat.status === 'online' ? 'bg-green-500' : 'bg-muted'}`}></div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Chat Window */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Chat Header */}
          <Card className="flex items-center justify-between p-4 border-b rounded-b-none">
            <div>
              <h3 className="font-semibold">{selectedChatData?.customerName}</h3>
              <p className="text-xs text-muted-foreground">{selectedChatData?.customerId}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">View Profile</Button>
            </div>
          </Card>

          {/* Messages */}
          <Card className="flex-1 overflow-y-auto p-4 space-y-4 rounded-t-none">
            {mockMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs rounded-lg p-3 ${msg.sender === 'support'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                    }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'support' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </Card>

          {/* Input Area */}
          <Card className="p-4 rounded-t-none border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="px-3">
                <Paperclip className="w-4 h-4" />
              </Button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="sm" variant="outline" className="px-3">
                <Smile className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSendMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
