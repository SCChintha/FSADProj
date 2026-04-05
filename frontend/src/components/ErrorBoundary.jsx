import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Dashboard render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="card">
            <div className="dashboard-title">Something went wrong</div>
            <p className="muted-text">
              A dashboard section crashed. Refresh the page or sign in again to recover.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
