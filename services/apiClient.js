import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// IMPORTANT: "localhost" only works when the backend and the app are
// running on the exact same machine (e.g. testing in a web browser).
// On a real phone via Expo Go, "localhost" means the PHONE itself —
// it will never reach your computer's backend. Replace the IP below
// with your computer's actual LAN IP address:
//   Windows: run `ipconfig` in Command Prompt, look for "IPv4 Address"
//            under your active adapter (usually starts 192.168.x.x)
//   Mac/Linux: run `ifconfig` or `ip addr`
// Your phone and computer must be on the same Wi-Fi network.
// const BASE_URL = "http://192.168.1.42:5000/api"; // <-- REPLACE with your machine's IP
const BASE_URL = "http://10.98.54.224:5000/api";

const TOKEN_STORAGE_KEY = "@maalgaddi_auth_token";

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
export { TOKEN_STORAGE_KEY };