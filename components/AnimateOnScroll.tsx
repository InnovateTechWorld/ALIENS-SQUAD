'use client'

import React, { useEffect, useRef, ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  animation?: string
  delay?: string
  threshold?: number
  as?: React.ElementType
}

export default function AnimateOnScroll({
  children,
  className = '',
  animation = 'anim-fade-up',
  delay = '',
  threshold = 0.15,
  as: Tag = 'div',
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.unobserve(el)
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag ref={ref} className={`scroll-anim ${animation} ${delay} ${className}`.trim()}>
      {children}
    </Tag>
  )
}
