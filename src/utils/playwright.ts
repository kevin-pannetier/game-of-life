interface PlaywrightWindow extends Window {
  __playwright?: boolean;
}

interface PlaywrightNavigator extends Navigator {
  webdriver: boolean;
}

export const isPlaywrightExecutionContext = () => {
  return (
    !!(window as PlaywrightWindow).__playwright ||
    !!(navigator as PlaywrightNavigator).webdriver ||
    window.location.href.includes('playwright')
  );
};
