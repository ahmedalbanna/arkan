"use client";
import { cn } from "@/lib/utils";
import * as React from "react";

// Animation Hook
export function useAnimation() {
    const [isVisible, setIsVisible] = React.useState(false)
    const [hasAnimated, setHasAnimated] = React.useState(false)
    const elementRef = React.useRef<HTMLElement | null>(null)
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setIsVisible(true)
                    setHasAnimated(true)
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        )

        if (elementRef.current) {
            observer.observe(elementRef.current)
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current)
            }
        }
    }, [hasAnimated])

    return { isVisible, elementRef }
}

// Animated Container Component
export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    animation?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'bounce-in'
    delay?: number
    duration?: number
    once?: boolean
}

const AnimatedContainer = React.forwardRef<HTMLDivElement, AnimatedContainerProps>(
    ({ className, children, animation = 'fade-in-up', delay = 0, duration = 600, once = true, ...props }, ref) => {
        const { isVisible, elementRef } = useAnimation()
        const [shouldAnimate, setShouldAnimate] = React.useState(false)

        React.useEffect(() => {
            if (isVisible) {
                const timer = setTimeout(() => {
                    setShouldAnimate(true)
                }, delay)

                return () => clearTimeout(timer)
            } else if (!once) {
                setShouldAnimate(false)
            }
        }, [isVisible, delay, once])

        const animationClasses = {
            'fade-in-up': 'animate-fade-in-up',
            'fade-in-down': 'animate-fade-in-down',
            'fade-in-left': 'animate-fade-in-left',
            'fade-in-right': 'animate-fade-in-right',
            'scale-in': 'animate-scale-in',
            'bounce-in': 'animate-bounce-in',
        }

        return (
            <div
                ref={(node) => {
                    if (ref) {
                        if (typeof ref === 'function') {
                            ref(node)
                        } else {
                            ref.current = node
                        }
                    }
                    if (elementRef.current !== node) {
                        elementRef.current = node as HTMLElement
                    }
                }}
                className={cn(
                    'transition-all duration-300',
                    shouldAnimate ? animationClasses[animation] : 'opacity-0',
                    className
                )}
                style={{
                    animationDelay: `${delay}ms`,
                    animationDuration: `${duration}ms`,
                }}
                {...props}
            >
                {children}
            </div>
        )
    }
)
AnimatedContainer.displayName = "AnimatedContainer"

// Staggered Animation Component
export interface StaggeredAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode[]
    staggerDelay?: number
    animation?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'scale-in'
    className?: string
}

const StaggeredAnimation = React.forwardRef<HTMLDivElement, StaggeredAnimationProps>(
    ({ children, staggerDelay = 100, animation = 'fade-in-up', className, ...props }, ref) => {
        return (
            <div ref={ref} className={className} {...props}>
                {children.map((child, index) => (
                    <AnimatedContainer
                        key={index}
                        animation={animation}
                        delay={index * staggerDelay}
                    >
                        {child}
                    </AnimatedContainer>
                ))}
            </div>
        )
    }
)
StaggeredAnimation.displayName = "StaggeredAnimation"

// Typing Animation Component
export interface TypingAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    text: string
    speed?: number
    delay?: number
    showCursor?: boolean
    onComplete?: () => void
}

const TypingAnimation = React.forwardRef<HTMLDivElement, TypingAnimationProps>(
    ({ className, text, speed = 100, delay = 0, showCursor = true, onComplete, ...props }, ref) => {
        const [displayedText, setDisplayedText] = React.useState('')
        const [isTyping, setIsTyping] = React.useState(false)

        React.useEffect(() => {
            const timer = setTimeout(() => {
                setIsTyping(true)
                let currentIndex = 0

                const typeInterval = setInterval(() => {
                    if (currentIndex < text.length) {
                        setDisplayedText(text.slice(0, currentIndex + 1))
                        currentIndex++
                    } else {
                        clearInterval(typeInterval)
                        setIsTyping(false)
                        onComplete?.()
                    }
                }, speed)

                return () => clearInterval(typeInterval)
            }, delay)

            return () => clearTimeout(timer)
        }, [text, speed, delay, onComplete])

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-block',
                    className
                )}
                {...props}
            >
                <span>{displayedText}</span>
                {showCursor && (
                    <span
                        className={cn(
                            'ml-1 border-r-2 border-primary animate-blink-caret',
                            isTyping && 'animate-pulse'
                        )}
                    >
                        |
                    </span>
                )}
            </div>
        )
    }
)
TypingAnimation.displayName = "TypingAnimation"

// Counter Animation Component
export interface CounterAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number
    duration?: number
    delay?: number
    prefix?: string
    suffix?: string
    decimals?: number
}

const CounterAnimation = React.forwardRef<HTMLDivElement, CounterAnimationProps>(
    ({ className, value, duration = 2000, delay = 0, prefix = '', suffix = '', decimals = 0, ...props }, ref) => {
        const [count, setCount] = React.useState(0)
        const [isAnimating, setIsAnimating] = React.useState(false)

        React.useEffect(() => {
            const timer = setTimeout(() => {
                setIsAnimating(true)
                const startTime = Date.now()
                const startValue = 0

                const updateCount = () => {
                    const elapsed = Date.now() - startTime
                    const progress = Math.min(elapsed / duration, 1)

                    // Easing function for smooth animation
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4)
                    const currentValue = startValue + (value - startValue) * easeOutQuart

                    setCount(currentValue)

                    if (progress < 1) {
                        requestAnimationFrame(updateCount)
                    }
                }

                requestAnimationFrame(updateCount)
            }, delay)

            return () => clearTimeout(timer)
        }, [value, duration, delay])

        return (
            <div
                ref={ref}
                className={cn('inline-block', className)}
                {...props}
            >
                {prefix}{count.toFixed(decimals)}{suffix}
            </div>
        )
    }
)
CounterAnimation.displayName = "CounterAnimation"

// Parallax Animation Component
export interface ParallaxAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    speed?: number
    direction?: 'up' | 'down' | 'left' | 'right'
}

const ParallaxAnimation = React.forwardRef<HTMLDivElement, ParallaxAnimationProps>(
    ({ className, children, speed = 0.5, direction = 'up', ...props }, ref) => {
        const [offset, setOffset] = React.useState(0)
        const elementRef = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
            const handleScroll = () => {
                if (elementRef.current) {
                    const rect = elementRef.current.getBoundingClientRect()
                    const scrolled = window.pageYOffset
                    const rate = scrolled * -speed

                    let transform = ''
                    switch (direction) {
                        case 'up':
                            transform = `translateY(${rate}px)`
                            break
                        case 'down':
                            transform = `translateY(${-rate}px)`
                            break
                        case 'left':
                            transform = `translateX(${rate}px)`
                            break
                        case 'right':
                            transform = `translateX(${-rate}px)`
                            break
                    }

                    elementRef.current.style.transform = transform
                }
            }

            window.addEventListener('scroll', handleScroll)
            return () => window.removeEventListener('scroll', handleScroll)
        }, [speed, direction])

        return (
            <div
                ref={(node) => {
                    if (ref) {
                        if (typeof ref === 'function') {
                            ref(node)
                        } else {
                            ref.current = node
                        }
                    }
                    if (elementRef.current !== node) {
                        elementRef
                    }
                }}
                className={className}
                {...props}
            >
                {children}
            </div>
        )
    }
)
ParallaxAnimation.displayName = "ParallaxAnimation"

export {
    AnimatedContainer, CounterAnimation,
    ParallaxAnimation, StaggeredAnimation,
    TypingAnimation
};

