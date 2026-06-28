import React from 'react';

type Props = {
  children: React.ReactNode;
  label?: string;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          flex: 1, minHeight: 0, padding: 24,
          fontFamily: 'var(--gh-font-mono, monospace)', fontSize: 12,
          color: '#e98b8b', overflow: 'auto',
        }}>
          <div style={{ marginBottom: 8, color: 'rgba(255,255,255,0.7)' }}>
            {this.props.label ?? 'Something went wrong'}
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
