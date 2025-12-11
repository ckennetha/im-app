import { createApp } from "vue"
import { configure } from "vue-gtag"
import { createPinia } from "pinia"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"

import router from "./router"
import App from "./App.vue"
import "./style.css"

// gtag
configure({
    tagId: "G-DQDNLN47EJ",
    pageTracker: {
        router,
        template: (to) => ({
            page_title: "InterMol",
            page_path: to.path,
            page_location: window.location.href,
        })
    }
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount("#app")