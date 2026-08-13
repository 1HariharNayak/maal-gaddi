import axios from "axios";

// Placeholder base URL — there is no real backend yet. This instance is
// set up now (per the project's "Axios setup only" requirement) so that
// swapping a dummy function in api.js for a real network call later is a
// one-function change, not a re-architecture of how screens fetch data.
const apiClient = axios.create({
    baseURL: "https://api.maalgaddi.com/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;