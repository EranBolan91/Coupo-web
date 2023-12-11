import React, { ReactNode, ErrorInfo } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children?: ReactNode; // Explicitly add the children property
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.log(error, errorInfo);
    // logErrorToMyService(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children || null; // Handle the case where children is undefined
  }
}

export default ErrorBoundary;
