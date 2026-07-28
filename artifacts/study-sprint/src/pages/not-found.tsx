import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center p-8 glass-panel rounded-2xl max-w-md w-full mx-4">
        <div className="flex mb-4 gap-2 justify-center">
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold">4</div>
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold">0</div>
          <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center font-bold">4</div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
