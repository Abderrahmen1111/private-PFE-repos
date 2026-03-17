"use client"

import React, { useState } from "react"
import { Facebook, Link as LinkIcon, Linkedin, Twitter, LucideIcon } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ShareLink {
  icon: LucideIcon
  href?: string
  onClick?: () => void
  label?: string
}

interface ShareButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  links: ShareLink[]
  children: React.ReactNode
}

export const ShareButton = ({ className, links, children, ...props }: ShareButtonProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative inline-flex justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Button */}
      <button
        className={cn(
          "relative w-40 h-10 rounded-3xl px-4 py-2 flex items-center justify-center",
          "bg-white dark:bg-black",
          "hover:bg-gray-50 dark:hover:bg-gray-950",
          "text-black dark:text-white",
          "border-2 border-gray-200 dark:border-white/10",
          "font-semibold transition-all duration-300",
          isHovered ? "opacity-0" : "opacity-100",
          className
        )}
        {...props}
      >
        <span className="flex items-center gap-2">{children}</span>
      </button>

      {/* Hover Links */}
      <div className="absolute inset-0 flex h-10 w-40 justify-center overflow-hidden rounded-3xl">
        {links.map((link, index) => {
          const Icon = link.icon
          return (
            <button
              type="button"
              key={index}
              onClick={link.onClick}
              title={link.label}
              className={cn(
                "h-10 w-10 flex items-center justify-center",
                "bg-black dark:bg-white",
                "text-white dark:text-black",
                "transition-all duration-300",
                "border-r border-white/10 last:border-r-0 dark:border-black/10",
                "hover:bg-gray-800 dark:hover:bg-gray-100",
                isHovered ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0",
                index === 0 && "transition-all duration-200",
                index === 1 && "delay-[50ms] transition-all duration-200",
                index === 2 && "delay-100 transition-all duration-200",
                index === 3 && "delay-150 transition-all duration-200"
              )}
            >
              <Icon className="size-4" />
            </button>
          )
        })}
      </div>
    </div>
  )
}