// code explantion in docs/hooks/use-mobile.md

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);
    
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [])

  return isMobile; // Return boolean or undefined during SSR
}
