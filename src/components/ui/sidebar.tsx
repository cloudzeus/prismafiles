"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SubLink {
  label: string;
  href: string;
}

interface LinkItem {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  subItems?: SubLink[];
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate, isHovered, setIsHovered }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate, isHovered, setIsHovered } = useSidebar();
  
  // Auto-expand sidebar when hovering over menu groups
  useEffect(() => {
    if (isHovered && !open) {
      setOpen(true);
    } else if (!isHovered && open) {
      // Add a small delay before collapsing to prevent flickering
      const timer = setTimeout(() => {
        setOpen(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHovered, open, setOpen]);

  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden lg:flex lg:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] shrink-0 border-r border-neutral-200 dark:border-neutral-700",
          className
        )}
        animate={{
          width: animate ? (open ? 300 : 80) : 300,
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      {/* Fixed 50px burger area on the left */}
      <div
        className={cn(
          "fixed left-0 top-0 h-16 w-[50px] lg:hidden bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 z-40 flex items-center justify-center"
        )}
        {...props}
      >
        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200 cursor-pointer h-6 w-6"
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Overlay sidebar that slides from left */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed left-0 top-0 h-full w-80 bg-white dark:bg-neutral-900 z-50 lg:hidden shadow-xl"
              )}
            >
              <div className="h-full flex flex-col">
                {/* Close button */}
                <div className="flex justify-end p-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
                  >
                    <IconX className="h-5 w-5 text-neutral-800 dark:text-neutral-200" />
                  </button>
                </div>
                
                {/* Sidebar content */}
                <div className="flex-1 px-4 pb-4">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: LinkItem;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubItems = link.subItems && link.subItems.length > 0;
  const isActive = pathname === link.href || (hasSubItems && link.subItems?.some(sub => pathname === sub.href));

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubItems) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="w-full">
      <Link
        href={link.href}
        className={cn(
          "flex items-center justify-start gap-2 group/sidebar py-3 px-3 rounded-lg transition-colors",
          isActive 
            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
            : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <div className="flex-shrink-0">
          {link.icon}
        </div>

        <motion.div
          animate={{
            display: animate ? (open ? "flex" : "none") : "flex",
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className="flex-1 flex items-center justify-between"
        >
          <span className="text-sm font-medium group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre">
            {link.label}
          </span>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <IconChevronRight className="h-4 w-4" />
            </motion.div>
          )}
        </motion.div>
      </Link>

      {/* Submenu */}
      {hasSubItems && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-6 mt-2 space-y-2">
                {link.subItems?.map((subItem, index) => {
                  const isSubActive = pathname === subItem.href;
                  return (
                    <Link
                      key={index}
                      href={subItem.href}
                      className={cn(
                        "block py-2 px-3 text-sm rounded-lg transition-colors",
                        isSubActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      )}
                    >
                      {subItem.label}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
