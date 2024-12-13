import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import React from 'react';
import classNames from 'classnames';

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  delayDuration?: number;
  className?: string;
};

const Tooltip = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 200,
  className,
}: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root delayDuration={delayDuration}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={5}
            className={classNames(
              'z-50 select-none rounded-md bg-zinc-900 px-3 py-1.5',
              'text-sm text-zinc-50 leading-none shadow-[0_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
              'will-change-[transform,opacity]',
              'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade',
              'data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade',
              'data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade',
              'data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade',
              className,
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-zinc-900" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

export default Tooltip;
