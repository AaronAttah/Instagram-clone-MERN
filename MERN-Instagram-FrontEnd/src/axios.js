import axios from "axios"

const instance  = axios.create({
    baseUrl: "http://localhost:8080"
})

export default instance;