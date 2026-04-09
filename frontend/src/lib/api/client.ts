import axios, { AxiosError } from "axios"
import { API_URL, TOKEN_KEY } from "@/lib/constants"

export const apiClient = axios.create({ baseURL: API_URL })

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

apiClient.interceptors.response.use(
    (res) => res,
    (err: AxiosError<{ error: string }>) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
            localStorage.clear()
            window.location.href = "/login"
        }
        return Promise.reject(err)
    }
)