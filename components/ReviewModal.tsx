'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { submitReview } from '@/lib/actions/reviews'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    businessName: string
    storeId?: number | null
    businessId?: string // Directory ID from URL
    itemId?: number // For product/service reviews
}

export function ReviewModal({ isOpen, onClose, businessName, storeId, businessId, itemId }: ReviewModalProps) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Veuillez sélectionner une note.')
            return
        }
        if (comment.trim().length < 3) {
            toast.error('Veuillez entrer un commentaire.')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitReview({
                store_id: storeId,
                item_id: itemId,
                rating,
                comment,
                businessId: businessId // Fixed key from directoryId to businessId
            })

            if (result.success) {
                toast.success('Merci pour votre avis !')
                setRating(0)
                setComment('')
                onClose()
            } else {
                toast.error(result.error || "Une erreur est survenue.")
            }
        } catch (error) {
            toast.error("Erreur de connexion.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Donnez votre avis</DialogTitle>
                    <DialogDescription>
                        Partagez votre expérience chez <span className="font-bold text-red-500">{businessName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="text-sm font-medium text-muted-foreground">Votre note</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="focus:outline-none transition-transform active:scale-90"
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={`w-10 h-10 ${(hover || rating) >= star
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            } transition-colors`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <span className="text-sm font-semibold text-yellow-600">
                                {['Médiéocre', 'Moyen', 'Bien', 'Très Bien', 'Excellent'][rating - 1]}
                            </span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="comment">Votre commentaire</Label>
                        <Textarea
                            id="comment"
                            placeholder="Racontez-nous votre expérience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="h-32 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Envoi en cours...
                            </>
                        ) : (
                            'Publier mon avis'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
