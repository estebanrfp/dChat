import Layout from './components/Layout'

import './fonts.css'
// import './index.css'
import './global.css'

if (navigator.serviceWorker) {
  navigator.serviceWorker.ready.then(registration => registration.update())
} else if (window.applicationCache) {
  window.applicationCache.update()
}

Layout()
