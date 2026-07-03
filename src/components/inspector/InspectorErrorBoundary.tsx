"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class InspectorErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[InspectorErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="rounded-lg border border-status-taken/40 bg-status-taken/10 p-5 text-sm text-status-taken"
            role="alert"
          >
            <p className="font-medium">Inspector encountered an error</p>
            <p className="mt-1 text-xs text-zinc-400">
              Try generating again or refresh the page.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 rounded-md border border-status-taken/40 px-3 py-1.5 text-xs font-medium hover:bg-status-taken/20"
            >
              Retry
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
