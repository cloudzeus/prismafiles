import { useCallback } from 'react'

interface ToastOptions {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    // Simple toast implementation - you can replace this with your preferred toast library
    const { title, description, variant = 'default', duration = 5000 } = options
    
    // Create toast element
    const toastElement = document.createElement('div')
    toastElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      variant === 'destructive' 
        ? 'bg-destructive text-destructive-foreground' 
        : 'bg-background text-foreground border'
    }`
    
    toastElement.innerHTML = `
      <div class="font-medium">${title}</div>
      ${description ? `<div class="text-sm mt-1 opacity-90">${description}</div>` : ''}
    `
    
    // Add to DOM
    document.body.appendChild(toastElement)
    
    // Remove after duration
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement)
      }
    }, duration)
  }, [])

  return { toast }
}

