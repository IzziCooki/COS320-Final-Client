// Theme management
interface ThemeState {
    isDark: boolean;
}

class ThemeManager {
    private static instance: ThemeManager;
    private state: ThemeState;
    private readonly THEME_KEY = 'theme-preference';

    private constructor() {
        this.state = {
            isDark: this.getInitialThemeState()
        };
        this.applyTheme();
    }

    public static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    private getInitialThemeState(): boolean {
        const savedTheme = localStorage.getItem(this.THEME_KEY);
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    private applyTheme(): void {
        document.documentElement.setAttribute(
            'data-theme',
            this.state.isDark ? 'dark' : 'light'
        );
        localStorage.setItem(this.THEME_KEY, this.state.isDark ? 'dark' : 'light');
    }

    public toggleTheme(): void {
        this.state.isDark = !this.state.isDark;
        this.applyTheme();
    }

    public getCurrentTheme(): boolean {
        return this.state.isDark;
    }
}

// DOM Elements
const themeToggle = document.querySelector('.theme-toggle') as HTMLButtonElement;
const themeIcon = document.querySelector('.theme-toggle__icon') as HTMLSpanElement;

// Event Listeners
function initializeThemeToggle(): void {
    if (!themeToggle || !themeIcon) return;

    const themeManager = ThemeManager.getInstance();
    
    // Set initial icon
    updateThemeIcon(themeManager.getCurrentTheme());

    themeToggle.addEventListener('click', () => {
        themeManager.toggleTheme();
        updateThemeIcon(themeManager.getCurrentTheme());
    });
}

function updateThemeIcon(isDark: boolean): void {
    if (!themeIcon) return;
    themeIcon.textContent = isDark ? '☀️' : '🌙';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeThemeToggle();
});
