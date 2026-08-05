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

interface ApiError {
    error: string
    code?: string
    billing?: {
        for_nonpayment?: boolean
        pending_cycles?: number
        oldest_unpaid_due?: string | null
    }
}

apiClient.interceptors.response.use(
    (res) => res,
    (err: AxiosError<ApiError>) => {
        if (typeof window !== "undefined") {
            if (err.response?.status === 401) {
                localStorage.clear()
                window.location.href = "/login"
            }

            // 402 = cliente suspendido por cobranza. Se guarda el detalle para
            // que la pantalla de aviso diga cuánto debe, y se manda para allá.
            if (err.response?.status === 402 && err.response.data?.code === "CLIENT_SUSPENDED") {
                sessionStorage.setItem(
                    "billing_block",
                    JSON.stringify(err.response.data.billing ?? {})
                )
                if (!window.location.pathname.startsWith("/suspended")) {
                    window.location.href = "/suspended"
                }
            }
        }
        return Promise.reject(err)
    }
)