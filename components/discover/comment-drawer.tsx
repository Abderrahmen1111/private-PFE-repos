'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter, 
  DrawerDescription 
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Image as ImageIcon, 
  Sticker, 
  Send, 
  Loader2, 
  X, 
  Smile,
  Trash2
} from 'lucide-react'
import { getReelComments, postReelComment, uploadCommentAttachment, ReelComment, deleteReelComment } from '@/lib/actions/comments'
import { toast } from 'sonner'

interface CommentDrawerProps {
  isOpen: boolean
  onClose: () => void
  reelId: number
}

const DEFAULT_STICKERS = [
  '🔥', '❤️', '🙌', '😍', '👏', '✨', '💯', '🚀', '⭐', '🎈', '🎉', '💡'
]

export function CommentDrawer({ isOpen, onClose, reelId }: CommentDrawerProps) {
  const [comments, setComments] = useState<ReelComment[]>([])
  const [loading, setLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showStickers, setShowStickers] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      fetchComments()
    }
  }, [isOpen, reelId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [comments])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const data = await getReelComments(reelId)
      setComments(data)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handlePost = async () => {
    if (!newComment && !selectedFile) return

    setIsPosting(true)
    try {
      let attachmentUrl = null
      let attachmentType: 'image' | 'sticker' | undefined

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        attachmentUrl = await uploadCommentAttachment(formData)
        attachmentType = 'image'
        if (!attachmentUrl) throw new Error("Erreur lors de l'upload de l'image")
      }

      const result = await postReelComment({
        reelId,
        content: newComment,
        attachmentUrl: attachmentUrl || undefined,
        attachmentType
      })

      if (result.success) {
        setNewComment('')
        setSelectedFile(null)
        setPreviewUrl(null)
        fetchComments()
      } else {
        toast.error(result.error)
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsPosting(false)
    }
  }

  const handleStickerSelect = async (sticker: string) => {
    setIsPosting(true)
    try {
      const result = await postReelComment({
        reelId,
        content: sticker,
        attachmentType: 'sticker'
      })
      if (result.success) {
        fetchComments()
        setShowStickers(false)
      }
    } finally {
      setIsPosting(false)
    }
  }

  const handleDelete = async (id: number) => {
    const result = await deleteReelComment(id)
    if (result.success) {
      setComments(prev => prev.filter(c => c.id !== id))
      toast.success('Commentaire supprimé')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-slate-900 border-slate-800 text-white h-[85vh] flex flex-col p-0">
        <DrawerHeader className="border-b border-slate-800 py-3 shrink-0">
          <DrawerTitle className="text-center text-sm font-bold uppercase tracking-widest">Commentaires</DrawerTitle>
          <DrawerDescription className="sr-only">Discutez à propos de ce reel</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                <Smile className="w-12 h-12 opacity-20" />
                <p className="text-sm">Soyez le premier à commenter</p>
              </div>
            ) : (
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 group">
                    <Avatar className="size-8 ring-1 ring-white/10">
                      <AvatarImage src={comment.user?.avatar_url || ''} />
                      <AvatarFallback className="bg-slate-800 text-[10px] font-bold">
                        {comment.user?.full_name?.substring(0, 2).toUpperCase() || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white/90">{comment.user?.full_name || 'Utilisateur'}</p>
                        <span className="text-[10px] text-white/30">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      
                      <div className="bg-slate-800/50 rounded-2xl rounded-tl-none p-3 border border-white/5 inline-block max-w-[90%]">
                        {comment.content && (
                          <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        )}
                        {comment.attachment_url && (
                          <div className={cn("mt-2 rounded-lg overflow-hidden border border-white/10", comment.attachment_type === 'sticker' ? 'bg-transparent border-0' : 'bg-black')}>
                            <img src={comment.attachment_url} className={cn("object-contain", comment.attachment_type === 'sticker' ? 'h-24 w-auto' : 'w-full max-h-64')} alt="Attachment" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 pl-1">
                        <button className="text-[10px] font-bold text-white/30 hover:text-white transition-colors uppercase tracking-tighter">Répondre</button>
                        <button 
                          className="text-[10px] font-bold text-red-500/50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-tighter"
                          onClick={() => handleDelete(comment.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
        </div>

        <DrawerFooter className="border-t border-slate-800 p-4 shrink-0 bg-slate-900/80 backdrop-blur-xl">
          {previewUrl && (
            <div className="relative mb-3 w-20 h-20 rounded-xl overflow-hidden border-2 border-primary shadow-xl">
              <img src={previewUrl} className="w-full h-full object-cover" />
              <button 
                className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white"
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {showStickers && (
            <div className="grid grid-cols-6 gap-2 mb-4 p-3 bg-slate-800/50 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2">
              {DEFAULT_STICKERS.map((s, idx) => (
                <button 
                  key={idx} 
                  className="text-2xl hover:scale-125 transition-transform"
                  onClick={() => handleStickerSelect(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect} 
            />
            <Button 
               variant="ghost" 
               size="icon" 
               className="rounded-full shrink-0 text-white/50 hover:text-white"
               onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-5 h-5" />
            </Button>
            <Button 
               variant="ghost" 
               size="icon" 
               className={cn("rounded-full shrink-0 transition-colors", showStickers ? "text-primary" : "text-white/50 hover:text-white")}
               onClick={() => setShowStickers(!showStickers)}
            >
              <Sticker className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input 
                placeholder="Ajouter un commentaire..." 
                className="bg-white/5 border-white/10 text-white rounded-full pr-10 focus:ring-primary h-12"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePost()}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full text-primary disabled:opacity-50"
                onClick={handlePost}
                disabled={isPosting || (!newComment && !selectedFile)}
              >
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
