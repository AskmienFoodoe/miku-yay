import axios from "axios";

// Instantiate an axios client
export const client = axios.create({
    baseURL: "https://cors-anywhere.herokuapp.com/https://bestdori.com/api"
})