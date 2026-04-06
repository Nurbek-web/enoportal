"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MotionItemProps {
  children: ReactNode;
  className?: string;
}

interface MotionItemInternalProps extends MotionItemProps {
  _index?: number;
}

function MotionItemInternal({ children, className, _index }: MotionItemInternalProps) {
  return (
    <div
      className={cn("animate-fade-slide-in", className)}
      style={{ animationDelay: `${(_index ?? 0) * 50}ms` }}
    >
      {children}
    </div>
  );
}

export function MotionItem(props: MotionItemProps) {
  return <MotionItemInternal {...props} />;
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
