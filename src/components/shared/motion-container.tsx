"use client";

import React, { ReactNode } from "react";

interface MotionItemProps {
  children: ReactNode;
  className?: string;
}

interface MotionItemInternalProps extends MotionItemProps {
  _index?: number;
}

export function MotionItem({ children, className, _index }: MotionItemInternalProps) {
  return (
    <div
      className={`animate-fade-slide-in${className ? ` ${className}` : ""}`}
      style={{ animationDelay: `${(_index ?? 0) * 50}ms` }}
    >
      {children}
    </div>
  );
}

export function MotionContainer({ children }: { children: ReactNode }) {
  const mapped = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child) && child.type === MotionItem) {
      return React.cloneElement(child as React.ReactElement<MotionItemInternalProps>, {
        _index: index,
      });
    }
    return child;
  });

  return <div className="flex flex-col gap-6">{mapped}</div>;
}
