import { useEffect, useRef, type RefObject } from 'react'

type ModalAccessibilityOptions = {
  initialFocus?: 'first-interactive' | 'dialog'
}

export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  { initialFocus = 'first-interactive' }: ModalAccessibilityOptions = {},
): RefObject<HTMLDivElement | null> {
  const modalRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const shouldFocusDialog = initialFocus === 'dialog' || window.matchMedia?.('(pointer: coarse)').matches
    const focusTarget = shouldFocusDialog
      ? null
      : modalRef.current?.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]):not([aria-label^="Close"])',
        )
    ;(focusTarget ?? modalRef.current)?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [initialFocus, isOpen])

  return modalRef
}
