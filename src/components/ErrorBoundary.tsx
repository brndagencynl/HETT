/**
 * Global Error Boundary
 * Catches React rendering errors and displays a user-friendly fallback UI.
 * Prevents white screens from unhandled exceptions.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details to console
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    // You could also send to an error reporting service here
    // e.g., Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = (): void => {
    // Clear error state and reload the page
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    // Navigate to home and clear error state
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '/';
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f6f8fa',
            fontFamily: 'Barlow, sans-serif',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              padding: '40px',
              textAlign: 'center',
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                margin: '0 auto 24px',
                backgroundColor: '#FEE2E2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#003878',
                marginBottom: '16px',
              }}
            >
              Er ging iets mis
            </h1>

            {/* Message */}
            <p
              style={{
                fontSize: '16px',
                color: '#4B5563',
                marginBottom: '24px',
                lineHeight: '1.6',
              }}
            >
              Er is een onverwachte fout opgetreden. Probeer de pagina opnieuw te laden.
            </p>

            {/* Error Details (collapsible in production) */}
            {this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#FEF2F2',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontWeight: '500',
                    color: '#DC2626',
                    marginBottom: '8px',
                  }}
                >
                  Technische details
                </summary>
                <pre
                  style={{
                    fontSize: '12px',
                    color: '#7F1D1D',
                    overflow: 'auto',
                    maxHeight: '200px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: '8px 0 0',
                    padding: '8px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '4px',
                  }}
                >
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}Stack trace:{'\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: '#003878',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = '#002E63')
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = '#003878')
                }
              >
                Herlaad pagina
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#003878',
                  backgroundColor: '#ffffff',
                  border: '2px solid #003878',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s, color 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#003878';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#003878';
                }}
              >
                Naar homepagina
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
