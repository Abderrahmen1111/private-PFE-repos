"use client"

import { Share2, Facebook, Twitter, Linkedin, Link as LinkIcon } from "lucide-react"
import { ShareButton } from "@/components/ui/share-button"

interface ShareBusinessButtonProps {
  businessName: string
  businessUrl: string
}

export function ShareBusinessButton({ businessName, businessUrl }: ShareBusinessButtonProps) {
  const encoded = encodeURIComponent(businessUrl)
  const text    = encodeURIComponent(`Découvrez ${businessName} sur Ro2ya !`)

  const shareLinks = [
    {
      icon: Twitter,
      label: "Partager sur Twitter",
      onClick: () => window.open(`https://twitter.com/intent/tweet?url=${encoded}&text=${text}`, "_blank"),
    },
    {
      icon: Facebook,
      label: "Partager sur Facebook",
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, "_blank"),
    },
    {
      icon: Linkedin,
      label: "Partager sur LinkedIn",
      onClick: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, "_blank"),
    },
    {
      icon: LinkIcon,
      label: "Copier le lien",
      onClick: () => {
        navigator.clipboard.writeText(businessUrl)
      },
    },
  ]

  return (
    <ShareButton links={shareLinks}>
      <Share2 className="w-4 h-4" />
      Partager
    </ShareButton>
  )
}