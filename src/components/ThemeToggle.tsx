
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-orange-600" />
      ) : (
        <Moon className="h-4 w-4 text-orange-600" />
      )}
    </Button>
  );
};
