'use client'
import { Component, ReactNode } from 'react'

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  
  static getDerivedStateFromError() { 
    return { hasError: true } 
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-8 text-center text-semantic-red">
          Something went wrong. Please refresh the page.
        </div>
      )
    }
    return this.props.children
  }
}
