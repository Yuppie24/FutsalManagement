import { Component, ReactNode } from "react";
import FutsalInformationPage from "../pages/dashboard/Futsal";

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps> {
  state = { hasError: false };

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please try again later.</div>;
    }
    return this.props.children;
  }
}

// Wrap FutsalInformationPage
<ErrorBoundary>
  <FutsalInformationPage />
</ErrorBoundary>;
