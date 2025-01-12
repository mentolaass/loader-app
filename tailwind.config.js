/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
		keyframes: {
			"in-scale": {
				'0%, 100%': { opacity: 0, scale: '90%' },
				'100%': { opacity: 100, scale: '100%' }
			},
			"from-right": {
				'0%, 100%': { opacity: 0, transform: 'translateX(10%)' },
				'100%': { opacity: 100, transform: 'translateX(0%)' }
			},
			"from-left": {
				'0%, 100%': { opacity: 0, transform: 'translateX(-10%)' },
				'100%': { opacity: 100, transform: 'translateX(0%)' }
			},
			"from-up": {
				'0%, 100%': { opacity: 0, transform: 'translateY(-10%)' },
				'100%': { opacity: 100, transform: 'translateY(0%)' }
			},
			"from-down": {
				'0%, 100%': { opacity: 0, transform: 'translateY(10%)' },
				'100%': { opacity: 100, transform: 'translateY(0%)' }
			},
			"arrow-in": {
				'0%': { opacity: 0, transform: 'translateY(100%)' },
				'100%': { opacity: 100, transform: 'translateY(0%)' }
			}
		},
		animation: {
			"from-right": "from-right 0.25s ease-out",
			"from-left": "from-left 0.25s ease-out",
			"from-up": "from-up 0.25s ease-out",
			"from-down": "from-down 0.25s ease-out",
			"in-scale": "in-scale 0.25s ease-out",
			"arrow-in": "arrow-in 0.25s ease-in-out forwards"
		},
  		fontFamily: {
  			inter: [
  				'Inter',
  				'Inter'
  			]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

