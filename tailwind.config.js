/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '2xs': '13px'
      },
      colors: {
        primary: "#1a1a1a",
        secondary: "#252525",
        whiting: '#6b6b6b',
        whiting2: '#ebebeb',
        graying: '#808080',
        redprimary: '#d70000',
        redsecondary: '#ffabab',
        darkred: '#d10000',
        blueprimary: '#005bd3',
        bluesecondary: '#4781ce',
        greenprimary: '#affebf',
        darkgreen: '#014b40'
      },
      boxShadow: {
        'default': '0rem -.0625rem 0rem 0rem #b5b5b5 inset, 0rem 0rem 0rem .0625rem rgba(0, 0, 0, .1) inset, 0rem .03125rem 0rem .09375rem #FFF inset',
        'pressed': '-0.0625rem 0rem 0.0625rem 0rem rgba(26, 26, 26, .122) inset, 0.0625rem 0rem 0.0625rem 0rem rgba(26, 26, 26, .122) inset, 0rem .125rem 0.0625rem 0rem rgba(26, 26, 26, .2) inset',
        'button-primary': '0rem -.0625rem 0rem .0625rem rgba(0, 0, 0, .8) inset, 0rem 0rem 0rem .0625rem rgba(48, 48, 48, 1) inset, 0rem .03125rem 0rem .09375rem rgba(255, 255, 255, .25) inset',
        'button-primary-hover': '0rem .0625rem 0rem 0rem rgba(255, 255, 255, .24) inset, .0625rem 0rem 0rem 0rem rgba(255, 255, 255, .2) inset, -.0625rem 0rem 0rem 0rem rgba(255, 255, 255, .2) inset, 0rem -.0625rem 0rem 0rem #000 inset, 0rem -.0625rem 0rem .0625rem #1A1A1A',
        'button-primary-pressed': '0rem .1875rem 0rem 0rem rgb(0, 0, 0) inset',
        'dark': ` 0 .03125rem .03125rem #ffffff1f,
      0 .0625rem .125rem #ffffff14,
      0 .125rem .25rem #ffffff1f;`
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(180deg, rgba(48, 48, 48, 0) 63.53%, rgba(255, 255, 255, .15) 100%)',
        'gradient-primary-hover': 'linear-gradient(180deg, rgba(48, 48, 48, 0) 63.53%, rgba(255, 255, 255, .15) 100%), rgba(26, 26, 26, 1)',
        'gradient-dark': `linear-gradient(180deg, rgba(10, 10, 10, 1) 0%, rgba(18, 18, 18, 1) 50%, rgba(41, 41, 41, 1) 100%),
                          linear-gradient(to bottom, rgba(25, 25, 25, 1), rgba(19, 19, 19, 1) 50%, rgba(10, 10, 10, 1)),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.04)),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0.04)),
                          linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.29) 10%, rgba(255, 255, 255, 0.22)),
                          linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.14) 20%, rgba(255, 255, 255, 0.3) 100%),
                          linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.2) 78%, rgba(0, 0, 0, 0.4) 100%),
                          linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(212, 212, 212, 0.5) 100%);`
      },
      backgroundColor: {
        'gradient-primary-base': 'rgba(48, 48, 48, 1)',
      }
    },
  },
  plugins: [],
}
