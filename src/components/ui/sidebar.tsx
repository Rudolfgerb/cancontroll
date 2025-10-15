import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { VariantProps, cva } from "class-variance-authority";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

type SidebarContext = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: () => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }

  return context;
}

interface SidebarProviderProps extends React.ComponentProps<"div"> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  function SidebarProvider(props, ref) {
    const { defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...rest } = props;
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          toggleSidebar();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    );
  }
);
SidebarProvider.displayName = "SidebarProvider";

interface SidebarProps extends React.ComponentProps<"div"> {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  function Sidebar(props, ref) {
    const { side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...rest } = props;
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    if (collapsible === "none") {
      return (
        <div
          className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("group peer hidden text-sidebar-foreground md:block")}
        data-state={state}
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "relative h-svh w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear",
            "group-data-[collapsible=offcanvas]:w-0",
            "group-data-[side=right]:rotate-180",
            variant === "floating" || variant === "inset"
              ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]",
          )}
        />
        <div
          className={cn(
            "fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            className,
          )}
        {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {}

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, SidebarTriggerProps>(
  function SidebarTrigger(props, ref) {
    const { className, onClick, ...rest } = props;
    const { toggleSidebar } = useSidebar();

    return (
      <Button
        ref={ref}
        data-sidebar="trigger"
        variant="ghost"
        size="icon"
        className={cn("h-7 w-7", className)}
        onClick={(event) => {
          onClick?.(event);
          toggleSidebar();
        }}
        {...props}
      >
        <PanelLeft />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    );
  }
);
SidebarTrigger.displayName = "SidebarTrigger";

interface SidebarRailProps extends React.ComponentProps<"button"> {}

const SidebarRail = React.forwardRef<HTMLButtonElement, SidebarRailProps>(
  function SidebarRail(props, ref) {
    const { className, ...rest } = props;
    const { toggleSidebar } = useSidebar();

    return (
      <button
        ref={ref}
        data-sidebar="rail"
        aria-label="Toggle Sidebar"
        tabIndex={-1}
        onClick={toggleSidebar}
        title="Toggle Sidebar"
        className={cn(
          "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] group-data-[side=left]:-right-4 group-data-[side=right]:left-0 hover:after:bg-sidebar-border sm:flex",
          "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarRail.displayName = "SidebarRail";

interface SidebarInsetLayoutProps extends React.ComponentProps<"main"> {}

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  SidebarInsetLayoutProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        "peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow",
        className
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = "SidebarInset";

interface SidebarInputProps extends React.ComponentProps<typeof Input> {}

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>, SidebarInputProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = "SidebarInput";

interface SidebarHeaderProps extends React.ComponentProps<"div"> {}

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  );
});
SidebarHeader.displayName = "SidebarHeader";

interface SidebarFooterProps extends React.ComponentProps<"div"> {}

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  SidebarFooterProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
  );
});
SidebarFooter.displayName = "SidebarFooter";

interface SidebarSeparatorProps extends React.ComponentProps<typeof Separator> {}

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  SidebarSeparatorProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = "SidebarSeparator";

interface SidebarContentProps extends React.ComponentProps<"div"> {}

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )} {...props} />
    );
  }
);
SidebarContent.displayName = "SidebarContent";

interface SidebarGroupProps extends React.ComponentProps<"div"> {}

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  SidebarGroupProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
    );
  }
);
SidebarGroup.displayName = "SidebarGroup";

interface SidebarGroupLabelProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
   SidebarGroupLabelProps>((props, ref) => {
    const { className, asChild = false, ...rest } = props;
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-label"
        className={cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className
        )}
        {...props}
      />
    );
  }
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

interface SidebarGroupActionProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  SidebarGroupActionProps>((props, ref) => {
    const { className, asChild = false, ...rest } = props;
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        data-sidebar="group-action"
        className={cn(
          "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 after:md:hidden",
          "group-data-[collapsible=icon]:hidden",
          className
        )}
        {...props}
      />
    );
  },
);
SidebarGroupAction.displayName = "SidebarGroupAction";

interface SidebarGroupContentProps extends React.ComponentProps<"div"> {}

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps>((props, ref) => {
  const { className, ...rest } = props;
    return (
      <div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
    );
  }
);

SidebarGroupContent.displayName = "SidebarGroupContent";


interface SidebarMenuProps extends React.ComponentProps<"ul">{}

let SidebarMenu = React.forwardRef<HTMLUListElement, SidebarMenuProps>(
  (props, ref) => {
    return (
      <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", props.className)} {...props} style={{border: '5px solid green'}}>
        <AuthMenuItem />
        <ProfileMenuItem />
        <CrewMenuItem />
      </ul>
    );
  }
);


import { Link } from 'react-router-dom';

// Add Crew menu item
const CrewMenuItem = () => (
  <SidebarMenuItem>
    <Link to="/crew">
      <SidebarMenuButton>
        Crew
      </SidebarMenuButton>
    </Link>
  </SidebarMenuItem>
);

const AuthMenuItem = () => (
  <SidebarMenuItem>
    <Link to="/auth">
      <SidebarMenuButton>
        Auth
      </SidebarMenuButton>
    </Link>
  </SidebarMenuItem>
);

const ProfileMenuItem = () => (
  <SidebarMenuItem>
    <Link to="/profile">
      <SidebarMenuButton>
        Profile
      </SidebarMenuButton>
    </Link>
  </SidebarMenuItem>
);

interface SidebarMenuItemProps extends React.ComponentProps<"li"> {}

const SidebarMenuItem = React.forwardRef<HTMLLIElement, SidebarMenuItemProps>((
  props,
  ref
) => {
  const { className, ...rest } = props;
  return (
    <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
  );
});

export { Sidebar, SidebarContent, SidebarProvider, SidebarMenu ,SidebarMenuItem};